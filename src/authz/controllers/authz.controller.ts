import {
  Controller,
  Req,
  Res,
  Post,
  Get,
  UseGuards,
  HttpException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import axios from 'axios';

// https://803f-185-246-208-183.ngrok.io/auth

@Controller()
export class AuthzController {
  @Get('/auth')
  auth(
    @Req()
    req: Request,
    @Res() res: Response,
  ) {
    res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
  }

  @Get('/auth/token')
  async askForToken(
    @Req()
    req: Request,
    @Res() res: Response,
  ) {
    try {
      const { data } = await axios({
        method: 'POST',
        url: 'https://discord-calendar-bot-by-dd.eu.auth0.com/oauth/token',
        headers: { 'content-type': 'application/json' },
        data: {
          client_id: process.env.AUTHZ_CLIENT_ID,
          client_secret: process.env.AUTHZ_SECRET,
          audience: process.env.AUTH0_AUDIENCE,
          grant_type: 'client_credentials',
        },
      });
      console.log('DATA ASK FOR TOKEN---> ', data);
      return res.status(200).json(data);
    } catch (err: any) {
      console.log('err ----> ', err);
      throw new HttpException(err.message, err.status);
    }
  }
}
