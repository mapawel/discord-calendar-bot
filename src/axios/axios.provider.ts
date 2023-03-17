import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { config } from 'dotenv';

config();

export class AxiosProvider {
  instance: AxiosInstance;

  constructor(config?: AxiosRequestConfig) {
    this.instance = axios.create(
      config || {
        baseURL: `https://discord.com/api/v10`,
        headers: {
          Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
          'Content-Type': 'application/json; charset=UTF-8',
          'User-Agent':
            'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)',
        },
      },
    );
  }
}
