import { config } from 'dotenv';
import { settings } from 'src/app-SETUP/settings';
import { Meeting } from '../discord-interactions/Meeting/interface/Meeting.interface';
import { AuthzService } from 'src/authz/service/authz.service';
import { FreeBusyRanges } from './types/Free-busy-ranges.type';
import { Calendar as CalendarEntity } from './entity/Calendar.entity';
import { Injectable } from '@nestjs/common';
import { AxiosProvider } from 'src/axios/provider/axios.provider';
import { CalendarException } from './exception/Calendar.exception';
import { UsersService } from 'src/users/providers/users.service';
import { AppUserDTO } from 'src/users/dto/App-user.dto';

config();

@Injectable()
export class CalendarService {
  constructor(
    private readonly authzService: AuthzService,
    private readonly axiosProvider: AxiosProvider,
    private readonly usersService: UsersService,
  ) {}

  // public async getAndSaveHostTokens(dId: string): Promise<{ error: string }> {
  //   // ALL TO REMOVE
  //   try {
  //     const currentCalendar: CalendarEntity | null =
  //       await CalendarEntity.findOne({
  //         where: { dId },
  //       });

  //     if (!currentCalendar) {
  //       return {
  //         error: 'No calendar found for this user who you want to meet with',
  //       };
  //     }

  //     if (
  //       Date.now() <
  //       currentCalendar.updatedAt.getTime() + settings.googleTokenMaxLifetimeMs
  //     ) {
  //       return { error: '' };
  //     }

  //     const refreshedGoogleToken: string =
  //       await this.authzService.refreshTokenForGoogle(dId);

  //     await CalendarEntity.update(
  //       {
  //         googleToken: refreshedGoogleToken,
  //       },
  //       {
  //         where: { dId },
  //       },
  //     );
  //     return { error: '' };
  //   } catch (err: any) {
  //     throw new CalendarException(err?.message);
  //   }
  // }

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
