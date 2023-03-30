import axios from 'axios';
import { config } from 'dotenv';
import { settings } from 'src/app-SETUP/settings';
import { Meeting } from '../Meeting/interface/Meeting.interface';
import { AuthzService } from 'src/authz/service/authz.service';
import { FreeBusyRanges } from './types/Free-busy-ranges.type';

config();

export class Calendar {
  private googleToken: string;
  private calendarId: string;
  constructor(private readonly authzService: AuthzService) {}

  public async calendarInit(hostAuthId: string) {
    this.googleToken = await this.authzService.getTokenForGoogle(hostAuthId);
    this.calendarId = await this.getMentorsCalendarId();
  }

  private async getMeetingWindows(daysRangeNo = 4): Promise<FreeBusyRanges> {
    // : '2023-03-30T10:00:00+02:00'
    try {
      const timeMin = new Date().toISOString().toString();
      const timeMax = new Date(Date.now() + daysRangeNo * 24 * 60 * 60 * 1000)
        .toISOString()
        .toString();
      const busyTimeRanges: {
        start: string;
        end: string;
      }[] = await this.checkFreeBusy(timeMin, timeMax);

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

  public async getMeetingTimeProposals(
    durationMs: number,
    resolutionFactor: 0.5 | 1 = 0.5,
  ): Promise<FreeBusyRanges> {
    const minimalResolutionMs = 15 * 60 * 1000;
    const finalResolutionMs: number =
      durationMs * resolutionFactor <= minimalResolutionMs
        ? minimalResolutionMs
        : durationMs * resolutionFactor;

    const meetingTimeProposalsTimes = (await this.getMeetingWindows()).map(
      ({ start, end }) => {
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
      },
    );
    return meetingTimeProposalsTimes.flat();
  }

  public async bookMeeting(meeting: Meeting) {
    try {
      const {
        summary,
        description,
        guestEmail,
        hostEmail,
        start,
        end,
      }: Meeting = meeting;

      const { data: data3 } = await axios({
        method: 'POST',
        url: `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events`,
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${this.googleToken}`,
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
      console.log('book meeting result ----> ', data3);
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  public async checkFreeBusy(
    timeMin: string,
    timeMax: string,
  ): Promise<FreeBusyRanges> {
    try {
      const {
        data: { calendars },
      }: {
        data: {
          calendars: Record<string, { busy: FreeBusyRanges }>;
        };
      } = await axios({
        method: 'POST',
        url: `https://www.googleapis.com/calendar/v3/freeBusy`,
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${this.googleToken}`,
        },
        data: {
          timeMin,
          timeMax,
          timeZone: 'UTX+02:00',
          // groupExpansionMax: integer,
          // calendarExpansionMax: integer,
          items: [
            {
              id: this.calendarId,
            },
          ],
        },
      });
      return calendars?.[this.calendarId]?.busy;
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  private async getMentorsCalendarId(): Promise<string> {
    try {
      const {
        data: { items },
      }: { data: { items: { summary: string; id: string }[] } } = await axios({
        method: 'GET',
        url: `https://www.googleapis.com/calendar/v3/users/me/calendarList`,
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${this.googleToken}`,
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
}
