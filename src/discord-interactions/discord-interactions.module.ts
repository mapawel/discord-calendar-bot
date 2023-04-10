import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DiscordInteractionController } from './controller/discord-interactions.controller';
import { IntegrationSlashCommandsService } from './service/subservices/interactions-slash-commands.service';
import { InteractionService } from './service/interactions.service';
import { MapDiscUserMiddleware } from '../middlewares/map-disc-user.middleware';
import { verifyKeyMiddleware } from 'discord-interactions';
import { AuthenticatedGuardService } from '../guards/guard-services/authentcated-guard.service';
import { RolesGuardService } from '../guards/guard-services/roles-guard.service';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { AppRoutes } from '../routes/routes.enum';
import { WhitelistGuardService } from '../guards/guard-services/whitelist-guard.service';
import { ApisModule } from '../APIs/APIs.module';
import { ResponseComponentsProvider } from './service/response-components.provider';
import { InteractionsGetMeetingService } from './service/subservices/interactions-get-meeting.service';
import { InteractionsBotManagingService } from './service/subservices/interactions-bot-managing.service';
import { HostCalendarModule } from '../Host-calendar/Host-calendar.module';

@Module({
  imports: [RolesModule, UsersModule, ApisModule, HostCalendarModule],
  controllers: [DiscordInteractionController],
  providers: [
    IntegrationSlashCommandsService,
    InteractionService,
    AuthenticatedGuardService,
    RolesGuardService,
    WhitelistGuardService,
    ResponseComponentsProvider,
    InteractionsGetMeetingService,
    InteractionsBotManagingService,
  ],
})
export class DiscordInteractionsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        verifyKeyMiddleware(process.env.DISCORD_PUBLIC_KEY || ''),
        MapDiscUserMiddleware,
      )
      .forRoutes(AppRoutes.DISCORD_INTERACTIONS_METHOD);
  }
}
