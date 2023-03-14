import { Controller, Get, HttpCode, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { GoogleOauthGuard } from '../guards/google-oauth.guard';
import { User } from 'src/calendar-bot/entities/User.entity';

@Controller('auth/google')
export class GoogleOauthController {
  @Get()
  @UseGuards(GoogleOauthGuard)
  async googleAuth() {
    // Guard redirects
  }

  @Get('/callback')
  @HttpCode(200)
  @UseGuards(GoogleOauthGuard)
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    // For now, we'll just show the user object
    console.log('req.query ----> ', req.query);
    //TODO -take a dicord ID from OAuth2 STATE!
    await User.update(
      { authenticated: true },
      {
        where: {
          discordId: '',
        },
      },
    );

    return res.send('You are authenticated!');
    // return req.user;
  }
}
