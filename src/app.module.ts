import { Module } from '@nestjs/common';
import { CalendarBotModule } from './calendar-bot/calendar-bot.module';
import { DatabaseModule } from './db/db.module';
import { GoogleOauthModule } from './auth/modules/google-oauth.module';

@Module({
  imports: [CalendarBotModule, DatabaseModule, GoogleOauthModule],
})
export class AppModule {}
