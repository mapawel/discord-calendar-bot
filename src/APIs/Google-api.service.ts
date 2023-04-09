import { AxiosInstance, AxiosResponse } from 'axios';
import axios from 'axios';
import { Calendar } from 'src/Calendar/entity/Calendar.entity';
import { GoogleApiServiceException } from './exceptions/Google-api-service.exception';

export class GoogleApiService {
  constructor(public axiosInstance: AxiosInstance) {
    this.initAxiosInstance();
  }

  private initAxiosInstance() {
    const axiosInstance: AxiosInstance = axios.create({
      baseURL: `${process.env.GOOGLE_API_URL}${process.env.GOOGLE_CALENDAR_API_ROUTE}`,
      headers: {
        'content-type': 'application/json',
      },
    });

    axiosInstance.interceptors.response.use(
      (config) => {
        return config;
      },
      async (error) => {
        try {
          if (error.response.status === 401) {
            const originalRequest = error.config;
            const calendarId: string = JSON.parse(originalRequest.data).items[0]
              .id;

            const googleRefreshToken: string =
              await this.getRefreshTokenFromCalendarInstance(calendarId);

            const access_token: string = await this.getRefreshedAccessToken(
              googleRefreshToken,
            );

            await this.updateCalendarInstanceWithNewAccessToken(
              calendarId,
              access_token,
            );

            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            const newResponse: AxiosResponse = await axiosInstance(
              originalRequest,
            );

            return Promise.resolve(newResponse);
          }
          return Promise.reject(error);
        } catch (err: any) {
          return Promise.reject(error);
        }
      },
    );

    this.axiosInstance = axiosInstance;
  }

  private async getRefreshTokenFromCalendarInstance(
    calendarId: string,
  ): Promise<string> {
    try {
      const currentCalendar: Calendar | null = await Calendar.findOne({
        where: { calendarId },
      });
      if (!currentCalendar?.googleRefreshToken)
        throw new Error('Calendar access cannot be refreshed');
      const { googleRefreshToken }: { googleRefreshToken: string } =
        currentCalendar;

      return googleRefreshToken;
    } catch (err: any) {
      throw new GoogleApiServiceException(err?.message, { causeErr: err });
    }
  }

  private async getRefreshedAccessToken(
    googleRefreshToken: string,
  ): Promise<string> {
    try {
      const {
        data: { access_token },
      }: { data: { access_token: string } } = await axios({
        method: 'POST',
        url: `${process.env.GOOGLE_API_URL}${process.env.GOOGLE_OAUTH_API_TOKEN_ROUTE}`,
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

      return access_token;
    } catch (err: any) {
      throw new GoogleApiServiceException(err?.message, { causeErr: err });
    }
  }

  private async updateCalendarInstanceWithNewAccessToken(
    calendarId: string,
    access_token: string,
  ) {
    try {
      await Calendar.update(
        {
          googleToken: access_token,
        },
        {
          where: { calendarId },
        },
      );
    } catch (err: any) {
      throw new GoogleApiServiceException(err?.message, { causeErr: err });
    }
  }
}
