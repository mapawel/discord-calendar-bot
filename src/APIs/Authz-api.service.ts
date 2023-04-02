import axios, { AxiosInstance } from 'axios';
import { config } from 'dotenv';

config();

export class AuthzApiService {
  constructor(
    public readonly axiosInstance: AxiosInstance = axios.create({
      baseURL: `https://discord-calendar-bot-by-dd.eu.auth0.com`,
      headers: {
        'content-type': 'application/json',
      },
    }),
  ) {}
}
