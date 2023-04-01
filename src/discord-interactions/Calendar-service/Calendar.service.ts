import { config } from 'dotenv';
import { settings } from 'src/app-SETUP/settings';
import { Meeting } from '../Meeting/interface/Meeting.interface';
import { AuthzService } from 'src/authz/service/authz.service';
import { FreeBusyRanges } from './types/Free-busy-ranges.type';
import { Calendar as CalendarEntity } from './entity/Calendar.entity';
import { Injectable } from '@nestjs/common';
import { AxiosProvider } from 'src/axios/provider/axios.provider';

config();

@Injectable()
export class CalendarService {
  constructor(
    private readonly authzService: AuthzService,
    private readonly axiosProvider: AxiosProvider,
  ) {}

  public async getTokens(dId: string, hostAuthId: string): Promise<void> {
    const currentCalendar = await CalendarEntity.findOne({
      where: { dId },
    });
    if (currentCalendar) return;

    const googleToken = await this.authzService.getTokenForGoogle(hostAuthId);
    const calendarId = await this.getMentorsCalendarId(googleToken);
    await CalendarEntity.create({ dId, googleToken, calendarId });
  }

  public async getMeetingTimeProposals(
    hostDId: string,
    durationMs: number,
    resolutionFactor: 0.5 | 1 = 0.5,
  ): Promise<{ data: FreeBusyRanges; error: string }> {
    const hostCalendar = await CalendarEntity.findByPk(hostDId);
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

    const meetingTimeProposalsTimes = (
      await this.getMeetingWindows(hostDId)
    ).map(({ start, end }) => {
      const meetingTimeProposals: FreeBusyRanges = [];
      const startRangeTime = new Date(start);
      const endRangeTima = new Date(end);

      while (startRangeTime.getTime() + durationMs <= endRangeTima.getTime()) {
        meetingTimeProposals.push({
          start: new Date(startRangeTime.getTime()).toISOString(),
          end: new Date(startRangeTime.getTime() + durationMs).toISOString(),
        });
        startRangeTime.setTime(startRangeTime.getTime() + finalResolutionMs);
      }
      return meetingTimeProposals;
    });
    return { data: meetingTimeProposalsTimes.flat(), error: '' };
  }

  public async bookMeeting(
    hostDId: string,
    meeting: Meeting,
  ): Promise<{ error: string }> {
    const hostCalendar = await CalendarEntity.findByPk(hostDId);
    if (!hostCalendar)
      return {
        error:
          'No calendar found - unavailable or still fetching data, try again in a few seconds',
      };

    const {
      googleToken,
      calendarId,
    }: { googleToken: string; calendarId: string } = hostCalendar;

    try {
      const {
        summary,
        description,
        guestEmail,
        hostEmail,
        start,
        end,
      }: Meeting = meeting;

      await this.axiosProvider.axiosGoogleAPI({
        method: 'POST',
        url: `/calendars/${calendarId}/events`,
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
              { method: 'email', minutes: 24 * 60 },
              { method: 'popup', minutes: 10 },
            ],
          },
        },
      });

      return {
        error: '',
      };
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  private async getMentorsCalendarId(googleToken: string): Promise<string> {
    try {
      const {
        data: { items },
      }: { data: { items: { summary: string; id: string }[] } } =
        await this.axiosProvider.axiosGoogleAPI({
          method: 'GET',
          url: `/users/me/calendarList`,
          headers: {
            Authorization: `Bearer ${googleToken}`,
          },
        });

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
    } catch (error: any) {
      throw new Error(error?.message);
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
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  private async checkFreeBusy(
    hostDId: string,
    timeMin: string,
    timeMax: string,
  ): Promise<FreeBusyRanges> {
    try {
      const hostCalendar = await CalendarEntity.findByPk(hostDId);
      if (!hostCalendar) throw new Error('No calendar found');

      const {
        googleToken,
        calendarId,
      }: { googleToken: string; calendarId: string } = hostCalendar;

      const {
        data: { calendars },
      }: {
        data: {
          calendars: Record<string, { busy: FreeBusyRanges }>;
        };
      } = await this.axiosProvider.axiosGoogleAPI({
        method: 'POST',
        url: `/freeBusy`,
        headers: {
          Authorization: `Bearer ${googleToken}`,
        },
        data: {
          timeMin,
          timeMax,
          timeZone: 'UTX+02:00',
          // groupExpansionMax: integer,
          // calendarExpansionMax: integer,
          items: [
            {
              id: calendarId,
            },
          ],
        },
      });
      return calendars?.[calendarId]?.busy;
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }
}
