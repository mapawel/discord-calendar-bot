import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseFilters,
  Get,
} from '@nestjs/common';
import { CalendarBotService } from '../service/calendar-bot.service';
import { MappedInteraction } from '../dto/interaction.dto';
import { AuthenticatedGuard } from '../guards/authenticated.guard';
import { ForbiddenExceptionFilter } from '../exception-filters/forbidden.filter';
import { Commands } from '../discord-commands/commands.enum';
import { AppRoutes } from 'src/routes/app-routes.enum';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@Controller()
export class CalendarBotController {
  constructor(private readonly calendarBotService: CalendarBotService) {}

  // @UseGuards(AuthGuard('jwt'))
  // @Get()
  // test() {
  //   return 'Hello World!';
  // }

  @Post(AppRoutes.DISCORD_INTERACTIONS_METHOD)
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
    if (type === 2 && name === Commands.GET_MEETING) {
      return await this.calendarBotService.responseForMeeting(id, token);
    }
    if (type === 2 && name === Commands.AUTHENTICATE) {
      return await this.calendarBotService.authenticate(discord_usr);
    }
  }
}
