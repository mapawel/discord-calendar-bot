import { Controller, Post, Body } from '@nestjs/common';
import { CalendarBotService } from '../service/calendar-bot.service';
import { APIInteraction } from 'discord-api-types/v10';

type InteractionType = APIInteraction & { data?: { name?: string } };

@Controller()
export class CalendarBotController {
  constructor(private readonly calendarBotService: CalendarBotService) {}

  @Post('/interactions')
  postForHello(
    @Body()
    { type, data }: InteractionType,
  ) {
    const name = data?.name;

    if (type === 1) return this.calendarBotService.responseWithPong();
    if (type === 2 && name === 'get-a-meeting')
      return this.calendarBotService.responseForMeeting();
  }
}
