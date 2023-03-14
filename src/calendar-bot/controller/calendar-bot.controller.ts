import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseFilters,
  Res,
} from '@nestjs/common';
import { CalendarBotService } from '../service/calendar-bot.service';
import { MappedInteraction } from '../dto/interaction.dto';
import { AuthenticatedGuard } from '../guards/authenticated.guard';
import { ForbiddenExceptionFilter } from '../exception-filters/forbidden.filter';
import { Response } from 'express';
import { InteractionResponseType } from 'discord-interactions';

@Controller()
export class CalendarBotController {
  constructor(private readonly calendarBotService: CalendarBotService) {}

  // @Get()
  // test() {
  //   return 'Hello World!';
  // }

  @Post('/interactions')
  @UseGuards(AuthenticatedGuard)
  @UseFilters(ForbiddenExceptionFilter)
  async postForHello(
    @Body()
    body: MappedInteraction,
  ) {
    const {
      type,
      data: { name },
      discord_usr,
      token,
      id,
    } = body;

    if (type === 1) return this.calendarBotService.responseWithPong();
    if (type === 2 && name === 'get-a-meeting') {
      return await this.calendarBotService.responseForMeeting(id, token);
    }
  }
}
