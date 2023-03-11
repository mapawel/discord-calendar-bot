import { Module } from '@nestjs/common';
import { CalendarBotController } from './controller/calendar-bot.controller';
import { CalendarBotService } from './service/calendar-bot.service';

@Module({
  imports: [],
  controllers: [CalendarBotController],
  providers: [CalendarBotService],
})
export class CalendarBotModule {}
