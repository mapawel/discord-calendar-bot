import { Module } from '@nestjs/common';
import { CalendarBotController } from './controller/calendar-bot.controller';
import { CalendarBotService } from './service/calendar-bot.service';
import { usersProviders } from './providers/users.providers';

@Module({
  imports: [],
  controllers: [CalendarBotController],
  providers: [CalendarBotService, ...usersProviders],
})
export class CalendarBotModule {}
