import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DiscordInteractionController } from './controller/discord-interactions.controller';
import { DiscordInteractionService } from './service/discord-interactions.service';
import { MapDiscUserMiddleware } from './middlewares/map-disc-user.middleware';
import { verifyKeyMiddleware } from 'discord-interactions';
import { AuthenticatedGuardService } from './guards/authentcated-guard.service';
import { RolesGuardService } from './guards/roles-guard.service';
import { RolesModule } from 'src/roles/roles.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [RolesModule, UsersModule],
  controllers: [DiscordInteractionController],
  providers: [
    DiscordInteractionService,
    AuthenticatedGuardService,
    RolesGuardService,
  ],
})
export class DiscordInteractionsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        verifyKeyMiddleware(process.env.PUBLIC_KEY || ''),
        MapDiscUserMiddleware,
      )
      .forRoutes('interactions');
  }
}
