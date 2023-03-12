import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { CalendarBotService } from '../service/calendar-bot.service';
import {
  InteractionWMemberDTO,
  InteractionWUserDTO,
} from '../dto/interaction.dto';
import { UserDto } from '../dto/user.dto';
import { GoogleOauthGuard } from 'src/auth/guards/google-oauth.guard';

@Controller()
export class CalendarBotController {
  constructor(private readonly calendarBotService: CalendarBotService) {}

  @Get()
  test() {
    return 'Hello World!';
  }

  @Post('/interactions')
  async postForHello(
    @Body()
    interaction: InteractionWMemberDTO | InteractionWUserDTO,
  ) {
    const { type, data } = interaction;
    const name = data?.name;
    const appUser: UserDto = interaction.user || interaction.member?.user;

    if (type === 1) return this.calendarBotService.responseWithPong();
    if (type === 2 && name === 'get-meeting')
      return await this.calendarBotService.responseForMeeting(appUser);
  }
}
