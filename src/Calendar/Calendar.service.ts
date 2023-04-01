import { config } from 'dotenv';
import { settings } from 'src/app-SETUP/settings';
import { Meeting } from '../discord-interactions/Meeting/interface/Meeting.interface';
import { AuthzService } from 'src/authz/service/authz.service';
import { FreeBusyRanges } from './types/Free-busy-ranges.type';
import { Calendar as CalendarEntity } from './entity/Calendar.entity';
import { Injectable } from '@nestjs/common';
import { AxiosProvider } from 'src/axios/provider/axios.provider';
import { CalendarException } from './exception/Calendar.exception';

config();

@Injectable()
export class CalendarService {
  constructor(
    private readonly authzService: AuthzService,
    private readonly axiosProvider: AxiosProvider,
  ) {}

  public async getAndSaveHostTokens(
    dId: string,
    hostAuthId: string,
  ): Promise<void> {
    try {
      const currentCalendar = await CalendarEntity.findOne({
        where: { dId },
      });

      if (
        Date.now() <
        currentCalendar?.updatedAt.getTime() + settings.googleTokenMaxLifetimeMs
      )
        return;

      console.log(' >>>>>>>>>>>>>>>>>>>>>>>>> ----> REFRESHING TOKENS');
      const googleToken = await this.authzService.getTokenForGoogle(hostAuthId);
      const calendarId = await this.getMentorsCalendarId(googleToken);
      await CalendarEntity.create({ dId, googleToken, calendarId });
    } catch (err: any) {
      throw new CalendarException(err?.message);
    }
  }
// ya29.a0Ael9sCPg9ZqIMvwqYGMhk6IShN-gb9EzU8FEAeWdAbm3d-uGYqsPH6HF0LwfW2hAVN0oGiGVZfMmNkYB2-hE5sXG3ZsJfc9tynQm1-Pn8pNUtjpZspE6zRJK4Frg5_jlGZhFpO_makSo8t_o0VJFXLLuGfIKfQaCgYKAXcSARISFQF4udJh3jo52ndy7W0P_UHsQo_WtQ0165
  public async getMeetingTimeProposals(
    hostDId: string,
    durationMs: number,
    resolutionFactor: 0.5 | 1 = 0.5,
  ): Promise<{ data: FreeBusyRanges; error: string }> {
    try {
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
      throw new CalendarException(err?.message);
    }
  }

  public async bookMeeting(
    hostDId: string,
    meeting: Meeting,
  ): Promise<{ error: string }> {
    try {
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
    } catch (err: any) {
      throw new CalendarException(err?.message);
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
        throw new CalendarException(
          `Mentor's calendar with name ${settings.calendarObligatoryName} not found`,
        );
      }

      return mentorCalendar.id;
    } catch (err: any) {
      throw new CalendarException(err?.message);
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
      throw new CalendarException(err?.message);
    }
  }

  private async checkFreeBusy(
    hostDId: string,
    timeMin: string,
    timeMax: string,
  ): Promise<FreeBusyRanges> {
    try {
      const hostCalendar = await CalendarEntity.findByPk(hostDId);
      if (!hostCalendar) throw new CalendarException('No calendar found');

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
          items: [
            {
              id: calendarId,
            },
          ],
        },
      });
      return calendars?.[calendarId]?.busy;
    } catch (err: any) {
      throw new CalendarException(err?.message);
    }
  }
}
