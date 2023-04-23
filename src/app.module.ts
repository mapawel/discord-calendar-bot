import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscordInteractionsModule } from './discord-interactions/discord-interactions.module';
import { DatabaseModule } from './db/db.module';
import { AuthzModule } from './authz/authz.module';
import { DiscordCommandsModule } from './discord-commands/discord-commands.module';
// import { APP_FILTER } from '@nestjs/core';
// import { AppErrorsFilter } from './exception-filters/app-errors.filter';
import { ResponseComponentsProvider } from './discord-interactions/service/response-components.provider';
import { DiscordApiService } from './APIs/Discord-api.service';

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
  providers: [
    // {
    //   provide: APP_FILTER,
    //   useClass: AppErrorsFilter,
    // },
    ResponseComponentsProvider,
    DiscordApiService,
  ],
})
export class AppModule {}
