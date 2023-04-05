import axios, { AxiosInstance } from 'axios';

export class AuthzApiService {
  constructor(
    public readonly axiosInstance: AxiosInstance = axios.create({
      baseURL: process.env.AUTH0_API_URL,
      headers: {
        'content-type': 'application/json',
      },
    }),
  ) {}
}
