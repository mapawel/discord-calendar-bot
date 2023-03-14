import { Module } from '@nestjs/common';
import { CalendarBotModule } from './calendar-bot/calendar-bot.module';
import { DatabaseModule } from './db/db.module';

@Module({
  imports: [CalendarBotModule, DatabaseModule],
})
export class AppModule {}
