import { HttpException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { config } from 'dotenv';
import { User } from 'src/calendar-bot/entities/User.entity';
import { AppRoutes } from 'src/routes/app-routes.enum';
import { AuthzRoutes } from 'src/routes/app-routes.enum';

config();
// TODO encode the state!

@Injectable()
export class AuthzService {
  buildRedirectLink(id: string): string {
    const querystring: URLSearchParams = new URLSearchParams({
      audience: `${process.env.AUTH0_AUDIENCE}`,
      scope: 'openid profile email',
      response_type: 'code',
      client_id: `${process.env.AUTHZ_CLIENT_ID}`,
      state: id,
      redirect_uri: `${process.env.APP_BASE_URL}${AppRoutes.LOGIN_CONTROLLER}${AppRoutes.LOGIN_CALLBACK_METHOD}`,
    });

    return `${process.env.AUTHZ_API_URL}${AuthzRoutes.AUTHZ_AUTHORIZE}?${querystring}`;
  }

  async getToken(code: string, state: string) {
    try {
      const { data } = await axios({
        method: 'POST',
        url: `${process.env.AUTHZ_API_URL}${AuthzRoutes.AUTHZ_TOKEN}`,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
          grant_type: 'authorization_code',
          client_id: process.env.AUTHZ_CLIENT_ID,
          client_secret: process.env.AUTHZ_SECRET,
          code,
          redirect_uri: `${process.env.APP_BASE_URL}${AppRoutes.LOGIN_CONTROLLER}${AppRoutes.LOGIN_CALLBACK_METHOD}`,
        },
      });

      await User.update(
        { authenticated: true },
        { where: { discordId: state } },
      );
      console.log('TOKENS---> ', data);
      console.log('STATE---> ', state);
    } catch (err: any) {
      throw new HttpException(err.message, err.status);
    }
  }
}
