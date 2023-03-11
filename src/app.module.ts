import { Module } from '@nestjs/common';
import { CalendarBotModule } from './calendar-bot/calendar-bot.module';

@Module({
  imports: [CalendarBotModule],
})
export class AppModule {}
