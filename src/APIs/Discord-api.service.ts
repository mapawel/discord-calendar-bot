import axios, { AxiosInstance } from 'axios';

export class DiscordApiService {
  constructor(
    public readonly axiosInstance: AxiosInstance = axios.create({
      baseURL: process.env.DISCORD_API_URL,
      headers: {
        Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'User-Agent': process.env.DISCORD_USER_AGENT,
      },
    }),
  ) {}
}
