import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DiscordInteractionController } from './controller/discord-interactions.controller';
import { DiscordInteractionService } from './service/discord-interactions.service';
import { MapDiscUserMiddleware } from './middlewares/map-disc-user.middleware';
import { verifyKeyMiddleware } from 'discord-interactions';
import { AuthenticatedGuardService } from './guards/authentcated-guard.service';
import { RolesGuardService } from './guards/roles-guard.service';
import { RolesModule } from 'src/roles/roles.module';
import { UsersModule } from 'src/users/users.module';
import { AppRoutes } from 'src/app-routes/app-routes.enum';
import { WhitelistGuardService } from './guards/whitelist-guard.service';
import { UserManagementModule } from 'src/user-management/user-management.module';
import { AxiosModule } from 'src/axios/axios.module';
import { StateModule } from 'src/app-state/state.module';

@Module({
  imports: [
    RolesModule,
    UsersModule,
    UserManagementModule,
    AxiosModule,
    StateModule,
  ],
  controllers: [DiscordInteractionController],
  providers: [
    DiscordInteractionService,
    AuthenticatedGuardService,
    RolesGuardService,
    WhitelistGuardService,
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
