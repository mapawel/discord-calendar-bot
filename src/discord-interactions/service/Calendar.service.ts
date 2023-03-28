import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { config } from 'dotenv';
import { settings } from 'src/app-SETUP/settings';
import { Meeting } from './Meeting/interface/Meeting.interface';

config();
// TODO tyy catch
@Injectable()
export class CalendarService {
  public async bookMeeting({
    googleToken,
    calendarId,
    meeting,
  }: {
    googleToken: string;
    calendarId: string;
    meeting: Meeting;
  }) {
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
        url: `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${googleToken}`,
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
    } catch (e: any) {
      console.log('book meeting error ----> ', JSON.stringify(e, null, 2));
    }
  }

  public async checkFreeBusy(googleToken: string, calendarId: string) {
    const { data: data3 } = await axios({
      method: 'POST',
      url: `https://www.googleapis.com/calendar/v3/freeBusy`,
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${googleToken}`,
      },
      data: {
        timeMin: '2023-03-27T10:00:00+02:00',
        timeMax: '2023-03-27T20:00:00+02:00',
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
    console.log('data3 ----> ', JSON.stringify(data3, null, 2));
  }

  public async getMentorsCalendarId(googleToken: string): Promise<string> {
    const {
      data: { items },
    }: { data: { items: { summary: string; id: string }[] } } = await axios({
      method: 'GET',
      url: `https://www.googleapis.com/calendar/v3/users/me/calendarList`,
      headers: {
        'content-type': 'application/json',
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
  }
}

// GET A USER ID FOR MENTOR?
// const { data: data2 } = await axios({
//   method: 'GET',
//   url: `https://discord-calendar-bot-by-dd.eu.auth0.com/api/v2/users-by-email`,
//   headers: {
//     'content-type': 'application/json',
//     Authorization: `Bearer ${data.access_token}`,
//   },
//   params: {
//     email: 'michalpawlowski2020@gmail.com',
//   },
// });

// console.log('!!!!! data2 ----> ', data2);
