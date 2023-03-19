import { Module } from '@nestjs/common';
import { CalendarBotModule } from './calendar-bot/calendar-bot.module';
import { DatabaseModule } from './db/db.module';
import { AuthzModule } from './authz/authz.module';
import { DiscordCommandsModule } from './discord-commands/discord-commands.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    UsersModule,
    DiscordCommandsModule,
    CalendarBotModule,
    AuthzModule,
    DatabaseModule,
  ],
})
export class AppModule {}
