import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscordInteractionsModule } from './discord-interactions/discord-interactions.module';
import { DatabaseModule } from './db/db.module';
import { AuthzModule } from './authz/authz.module';
import { DiscordCommandsModule } from './discord-commands/discord-commands.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.discord', '.env.authz', '.env.google'],
    }),
    DiscordCommandsModule,
    DiscordInteractionsModule,
    AuthzModule,
    DatabaseModule,
  ],
})
export class AppModule {}
