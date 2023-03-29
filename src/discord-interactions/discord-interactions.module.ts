import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DiscordInteractionController } from './controller/discord-interactions.controller';
import { IntegrationSlashCommandsService } from './service/interactions-slash-commands.service';
import { IntegrationComponentsService } from './service/interactions-components.service';
import { MapDiscUserMiddleware } from './middlewares/map-disc-user.middleware';
import { verifyKeyMiddleware } from 'discord-interactions';
import { AuthenticatedGuardService } from './guards/authentcated-guard.service';
import { RolesGuardService } from './guards/roles-guard.service';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { AppRoutes } from '../app-routes/app-routes.enum';
import { WhitelistGuardService } from './guards/whitelist-guard.service';
import { AxiosModule } from '../axios/axios.module';
import { StateModule } from '../app-state/state.module';
import { ResponseComponentsProvider } from './service/response-components.provider';
import { ResponseComponentsHelperService } from './service/response-components-helper.service';
import { AuthzModule } from '../authz/authz.module';
import { MeetingService } from './service/Meeting/Meeting.service';

@Module({
  imports: [RolesModule, UsersModule, AxiosModule, StateModule, AuthzModule],
  controllers: [DiscordInteractionController],
  providers: [
    IntegrationSlashCommandsService,
    IntegrationComponentsService,
    AuthenticatedGuardService,
    RolesGuardService,
    WhitelistGuardService,
    ResponseComponentsProvider,
    MeetingService,
    ResponseComponentsHelperService,
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
