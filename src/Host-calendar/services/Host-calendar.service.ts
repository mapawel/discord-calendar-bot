import { Meeting } from '../../discord-interactions/Meeting/Meeting.interface';
import { FreeBusyRanges } from '../types/Free-busy-ranges.type';
import { HostCalendar } from '../entity/Host-calendar.entity';
import { Injectable } from '@nestjs/common';
import { HostCalendarException } from '../exception/Host-calendar.exception';
import { GoogleApiService } from 'src/APIs/Google-api.service';
import { settings } from '../../app-SETUP/settings';
import { isStatusValid } from 'src/APIs/APIs.helpers';
import { AxiosResponse } from 'axios';

@Injectable()
export class HostCalendarService {
  constructor(private readonly googleApiService: GoogleApiService) {}

  public async getMentorsCalendarId(googleToken: string): Promise<string> {
    try {
      const {
        data: { items },
        status,
      }: {
        data: { items: { summary: string; id: string }[] };
        status: number;
      } = await this.googleApiService.axiosInstance({
        method: 'GET',
        url: `${process.env.GOOGLE_CALENDARS_LIST_ROUTE}`,
        headers: {
          Authorization: `Bearer ${googleToken}`,
        },
      });

      if (!isStatusValid(status))
        throw new Error(
          `Google API error while getting a calendar ID: ${status}`,
        );

      const mentorCalendar = items.find(
        ({ summary }: { summary: string }) =>
          summary === settings.calendarObligatoryName,
      );
      if (!mentorCalendar?.id) {
        throw new Error(
          `Mentor's calendar with name ${settings.calendarObligatoryName} not found`,
        );
      }

      return mentorCalendar.id;
    } catch (err: any) {
      throw new HostCalendarException(err?.message, { causeErr: err });
    }
  }

  public async getMeetingTimeProposals(
    hostDId: string,
    durationMs: number,
    resolutionFactor: 0.5 | 1 = 0.5,
  ): Promise<{ data: FreeBusyRanges; error: string }> {
    try {
      const hostCalendar = await HostCalendar.findByPk(hostDId);
      if (!hostCalendar)
        return {
          data: [] as FreeBusyRanges,
          error:
            'No calendar found - unavailable or still fetching data, try again in a few seconds',
        };

      const minimalResolutionMs = 15 * 60 * 1000;
      const finalResolutionMs: number =
        durationMs * resolutionFactor <= minimalResolutionMs
          ? minimalResolutionMs
          : durationMs * resolutionFactor;

      const meetingTimeProposalsTimes: FreeBusyRanges[] = (
        await this.getMeetingWindows(hostDId)
      ).map(({ start, end }) => {
        const meetingTimeProposals: FreeBusyRanges = [];
        const startRangeTime = new Date(start);
        const endRangeTima = new Date(end);

        while (
          startRangeTime.getTime() + durationMs <=
          endRangeTima.getTime()
        ) {
          meetingTimeProposals.push({
            start: new Date(startRangeTime.getTime()).toISOString(),
            end: new Date(startRangeTime.getTime() + durationMs).toISOString(),
          });
          startRangeTime.setTime(startRangeTime.getTime() + finalResolutionMs);
        }
        return meetingTimeProposals;
      });
      return { data: meetingTimeProposalsTimes.flat(), error: '' };
    } catch (err: any) {
      throw new HostCalendarException(err?.message, { causeErr: err });
    }
  }

  public async bookMeeting(
    hostDId: string,
    meeting: Meeting,
  ): Promise<{ error: string }> {
    try {
      const hostCalendar = await HostCalendar.findByPk(hostDId);
      if (!hostCalendar)
        return {
          error:
            'No calendar found - unavailable or still fetching data, try again in a few seconds',
        };

      const {
        googleToken,
        calendarId,
      }: { googleToken: string; calendarId: string } = hostCalendar;

      const {
        summary,
        description,
        guestEmail,
        hostEmail,
        start,
        end,
      }: Meeting = meeting;

      const { status }: AxiosResponse =
        await this.googleApiService.axiosInstance({
          method: 'POST',
          url: `${process.env.GOOGLE_CALENDARS_ROUTE}/${calendarId}${process.env.GOOGLE_EVENTS_ROUTE}`,
          headers: {
            Authorization: `Bearer ${googleToken}`,
          },
          data: {
            summary,
            description,
            start: {
              dateTime: start,
            },
            end: {
              dateTime: end,
            },
            attendees: [{ email: guestEmail }, { email: hostEmail }],
            reminders: {
              useDefault: false,
              overrides: [
                { method: 'email', minutes: 4 * 60 },
                { method: 'popup', minutes: 10 },
              ],
            },
          },
        });

      if (!isStatusValid(status))
        throw new Error(
          `Google API error while bookine a meeting in google calendar: ${status}`,
        );

      return {
        error: '',
      };
    } catch (err: any) {
      throw new HostCalendarException(err?.message, { causeErr: err });
    }
  }

  private async getMeetingWindows(
    hostDId: string,
    daysRangeNo = 4,
  ): Promise<FreeBusyRanges> {
    try {
      const timeMin = new Date().toISOString().toString();
      const timeMax = new Date(Date.now() + daysRangeNo * 24 * 60 * 60 * 1000)
        .toISOString()
        .toString();
      const busyTimeRanges: {
        start: string;
        end: string;
      }[] = await this.checkFreeBusy(hostDId, timeMin, timeMax);

      const freeTimeWindows: FreeBusyRanges = busyTimeRanges.flatMap(
        ({ start, end }, i, arr) => {
          const l = arr.length;
          if (i === l - 1) return [];
          return [
            {
              start: end,
              end: arr[i + 1].start,
            },
          ];
        },
      );
      return freeTimeWindows;
    } catch (err: any) {
      throw new HostCalendarException(err?.message, { causeErr: err });
    }
  }

  private async checkFreeBusy(
    hostDId: string,
    timeMin: string,
    timeMax: string,
  ): Promise<FreeBusyRanges> {
    try {
      const hostCalendar = await HostCalendar.findByPk(hostDId);
      if (!hostCalendar) throw new Error('No calendar found');

      const {
        googleToken,
        calendarId,
      }: { googleToken: string; calendarId: string } = hostCalendar;

      const {
        data: { calendars },
        status,
      }: {
        data: {
          calendars: Record<string, { busy: FreeBusyRanges }>;
        };
        status: number;
      } = await this.googleApiService.axiosInstance({
        method: 'POST',
        url: `${process.env.GOOGLE_CALENDAR_FREEBUSY_ROUTE}`,
        headers: {
          Authorization: `Bearer ${googleToken}`,
        },
        data: {
          timeMin,
          timeMax,
          timeZone: 'UTX+02:00',
          items: [
            {
              id: calendarId,
            },
          ],
        },
      });

      if (!isStatusValid(status))
        throw new Error(`Google API error while checking free busy: ${status}`);

      if (!calendars?.[calendarId])
        throw new Error(
          `Google API error while checking connected calendar. Calendar with id: ${calendarId} not found`,
        );

      return calendars?.[calendarId]?.busy;
    } catch (err: any) {
      throw new HostCalendarException(err?.message, { causeErr: err });
    }
  }
}
