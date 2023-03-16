import {
  Controller,
  Req,
  Res,
  Query,
  Get,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import axios from 'axios';
import { config } from 'dotenv';

config();

@Controller('/auth')
export class AuthzController {
  @Get('/login')
  async authorize(
    @Req()
    req: Request,
    @Res() res: Response,
  ) {
    try {
      const querystring: URLSearchParams = new URLSearchParams({
        audience: `${process.env.AUTH0_AUDIENCE}`,
        scope: 'openid profile email',
        response_type: 'code',
        client_id: `${process.env.AUTHZ_CLIENT_ID}`,
        state: JSON.stringify({ test: '12345678' }),
        redirect_uri: `${process.env.APP_BASE_URL}/auth/callback`,
      });

      res.redirect(
        `https://discord-calendar-bot-by-dd.eu.auth0.com/authorize?${querystring}`,
      );
    } catch (err: any) {
      throw new HttpException(err.message, err.status);
    }
  }

  @Get('/callback')
  async getToken(
    @Query()
    { code, state }: { code: string; state: string },
    @Res() res: Response,
  ) {
    try {
      const { data } = await axios({
        method: 'POST',
        url: 'https://discord-calendar-bot-by-dd.eu.auth0.com/oauth/token',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
          grant_type: 'authorization_code',
          client_id: process.env.AUTHZ_CLIENT_ID,
          client_secret: process.env.AUTHZ_SECRET,
          code,
          redirect_uri: `${process.env.APP_BASE_URL}/auth/callback`,
        },
      });
      console.log('TOKENS---> ', data);
      console.log('STATE---> ', JSON.parse(state));
      res.send(data);
    } catch (err: any) {
      throw new HttpException(err.message, err.status);
    }
  }
}
