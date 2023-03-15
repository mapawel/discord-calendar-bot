import { Module } from '@nestjs/common';
import { CalendarBotModule } from './calendar-bot/calendar-bot.module';
import { DatabaseModule } from './db/db.module';
import { AuthzModule } from './authz/authz.module';
import { AuthzController } from './authz/controllers/authz.controller';

@Module({
  controllers: [AuthzController],
  imports: [CalendarBotModule, AuthzModule, DatabaseModule],
})
export class AppModule {}
