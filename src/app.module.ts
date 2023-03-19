import { Module } from '@nestjs/common';
import { DiscordInteractionsModule } from './discord-interactions/discord-interactions.module';
import { DatabaseModule } from './db/db.module';
import { AuthzModule } from './authz/authz.module';
import { DiscordCommandsModule } from './discord-commands/discord-commands.module';

@Module({
  imports: [
    DiscordCommandsModule,
    DiscordInteractionsModule,
    AuthzModule,
    DatabaseModule,
  ],
})
export class AppModule {}
