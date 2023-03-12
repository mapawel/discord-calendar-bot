import { Controller, Get, HttpCode, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { GoogleOauthGuard } from '../guards/google-oauth.guard';

@Controller('auth')
export class GoogleOauthController {
  @Get('/google')
  @UseGuards(GoogleOauthGuard)
  async googleAuth() {
    // Guard redirects
  }

  @Get('/callback')
  @HttpCode(200)
  @UseGuards(GoogleOauthGuard)
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    // For now, we'll just show the user object
    console.log('req.user ----> ', req.user);
    return res.send(req.user);
    // return req.user;
  }
}
