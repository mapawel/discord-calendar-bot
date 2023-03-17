import { Module } from '@nestjs/common';
import { CalendarBotModule } from './calendar-bot/calendar-bot.module';
import { DatabaseModule } from './db/db.module';
import { AuthzModule } from './authz/authz.module';

@Module({
  imports: [CalendarBotModule, AuthzModule, DatabaseModule],
})
export class AppModule {}
