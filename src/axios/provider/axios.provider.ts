import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { config } from 'dotenv';

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

    public readonly axiosGoogleAPI: AxiosInstance = axios.create({
      baseURL: `https://www.googleapis.com/calendar/v3`,
      headers: {
        'content-type': 'application/json',
      },
    }),

    public readonly axiosAuthzAPI: AxiosInstance = axios.create({
      baseURL: `https://discord-calendar-bot-by-dd.eu.auth0.com`,
      headers: {
        'content-type': 'application/json',
      },
    }),
  ) {}
}
