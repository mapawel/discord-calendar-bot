import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DiscordInteractionController } from './controller/discord-interactions.controller';
import { IntegrationSlashCommandsService } from './service/interactions-slash-commands.service';
import { IntegrationComponentsService } from './service/interactions-components.service';
import { MapDiscUserMiddleware } from './middlewares/map-disc-user.middleware';
import { verifyKeyMiddleware } from 'discord-interactions';
import { AuthenticatedGuardService } from './guards/guard-services/authentcated-guard.service';
import { RolesGuardService } from './guards/guard-services/roles-guard.service';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { AppRoutes } from '../routes/routes.enum';
import { WhitelistGuardService } from './guards/guard-services/whitelist-guard.service';
import { ApisModule } from 'src/APIs/APIs.module';
import { StateModule } from '../app-state/State.module';
import { ResponseComponentsProvider } from './service/response-components.provider';
import { MeetingService } from './Meeting/Meeting.service';
import { InteractionsGetMeetingService } from './service/subservices/interactions-get-meeting.service';
import { InteractionsBotManagingService } from './service/subservices/interactions-bot-managing.service';
import { CalendarModule } from 'src/Calendar/Calendar.module';

@Module({
  imports: [RolesModule, UsersModule, ApisModule, StateModule, CalendarModule],
  controllers: [DiscordInteractionController],
  providers: [
    IntegrationSlashCommandsService,
    IntegrationComponentsService,
    AuthenticatedGuardService,
    RolesGuardService,
    WhitelistGuardService,
    ResponseComponentsProvider,
    MeetingService,
    InteractionsGetMeetingService,
    InteractionsBotManagingService,
  ],
})
export class DiscordInteractionsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        verifyKeyMiddleware(process.env.PUBLIC_KEY || ''),
        MapDiscUserMiddleware,
      )
      .forRoutes(AppRoutes.DISCORD_INTERACTIONS_METHOD);
  }
}
