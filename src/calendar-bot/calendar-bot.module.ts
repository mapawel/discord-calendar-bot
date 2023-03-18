import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CalendarBotController } from './controller/calendar-bot.controller';
import { CalendarBotService } from './service/calendar-bot.service';
import { usersProviders } from './providers/users.providers';
import { MapDiscUserMiddleware } from './middlewares/map-disc-user.middleware';
import { verifyKeyMiddleware } from 'discord-interactions';
import { AuthenticatedGuardService } from './guards/authentcated-guard.service';
import { AxiosModule } from 'src/axios/axios.module';
import { RolesGuardService } from './guards/roles-guard.service';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports: [RolesModule, AxiosModule],
  controllers: [CalendarBotController],
  providers: [
    CalendarBotService,
    ...usersProviders,
    AuthenticatedGuardService,
    RolesGuardService,
  ],
})
export class CalendarBotModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        verifyKeyMiddleware(process.env.PUBLIC_KEY || ''),
        MapDiscUserMiddleware,
      )
      .forRoutes('interactions');
  }
}
