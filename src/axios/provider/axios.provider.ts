import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { config } from 'dotenv';
import { Calendar } from 'src/Calendar/entity/Calendar.entity';

config();

// @Injectable()
export class AxiosProvider {
  constructor(
    public readonly axiosDiscordAPI: AxiosInstance = axios.create({
      baseURL: `https://discord.com/api/v10`,
      headers: {
        Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'User-Agent':
          'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)',
      },
    }),

    public readonly axiosAuthzAPI: AxiosInstance = axios.create({
      baseURL: `https://discord-calendar-bot-by-dd.eu.auth0.com`,
      headers: {
        'content-type': 'application/json',
      },
    }),

    public readonly axiosGoogleAPI: AxiosInstance,
  ) {
    const axiosInstance: AxiosInstance = axios.create({
      baseURL: `https://www.googleapis.com/calendar/v3`,
      headers: {
        'content-type': 'application/json',
      },
    });

    axiosInstance.interceptors.response.use(
      function (config) {
        return config;
      },
      async function (error) {
        try {
          if (error.response.status === 401) {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>error.code ----> ', error.code);
            const originalRequest = error.config;
            const calendarId: string = JSON.parse(originalRequest.data).items[0]
              .id;

            const currentCalendar: Calendar | null = await Calendar.findOne({
              where: { calendarId },
            });
            if (!currentCalendar?.googleRefreshToken)
              throw new Error('Calendar access cannot be refreshed');
            const { googleRefreshToken }: { googleRefreshToken: string } =
              currentCalendar;
            const {
              data: { access_token },
            }: { data: { access_token: string } } = await axios({
              method: 'POST',
              url: `https://www.googleapis.com/oauth2/v4/token`,
              headers: {
                'content-type': 'application/json',
              },
              data: {
                client_id: process.env.GOOGLE_API_CLIENT_ID,
                client_secret: process.env.GOOGLE_API_CLIENT_SECRET,
                refresh_token: googleRefreshToken,
                grant_type: 'refresh_token',
              },
            });

            await Calendar.update(
              {
                googleToken: access_token,
              },
              {
                where: { calendarId },
              },
            );
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            const newResponse: AxiosResponse = await axiosInstance(
              originalRequest,
            );
            console.log('>>>>>>>>>>>>>>>>> TOKEN REFRESHED ----> ');
            return Promise.resolve(newResponse);
          }
          console.log(
            '>>>>>>>>>>>>>>>>> TOKEN NOT REFRESHED DUE TO NOT ENTER IN REFRESHING FN ----> ',
          );
          return Promise.reject(error);
        } catch (err: any) {
          console.log(
            '>>>>>>>>>>>>>>>>> TOKEN NOT REFRESHED DUE TO ERRORS WHILE REFRESHING ----> ',
          );
          return Promise.reject(error);
        }
      },
    );

    this.axiosGoogleAPI = axiosInstance;
  }
}
