import axios from 'axios';
import { config } from 'dotenv';
import { settings } from 'src/app-SETUP/settings';
import { Meeting } from '../Meeting/interface/Meeting.interface';
import { AuthzService } from 'src/authz/service/authz.service';

config();

export class Calendar {
  private googleToken: string;
  private calendarId: string;
  constructor(private readonly authzService: AuthzService) {}

  public async calendarInit(hostAuthId: string) {
    this.googleToken = await this.authzService.getTokenForGoogle(hostAuthId);
    this.calendarId = await this.getMentorsCalendarId();
  }

  public async bookMeeting({ meeting }: { meeting: Meeting }) {
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
            // dateTime: '2023-03-29T16:30:00+02:00',
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

  public async checkFreeBusy() {
    try {
      const { data: data3 } = await axios({
        method: 'POST',
        url: `https://www.googleapis.com/calendar/v3/freeBusy`,
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${this.googleToken}`,
        },
        data: {
          timeMin: '2023-03-30T10:00:00+02:00',
          timeMax: '2023-03-30T20:00:00+02:00',
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
      console.log('data3 ----> ', JSON.stringify(data3, null, 2));
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
