import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CalendarBotController } from './controller/calendar-bot.controller';
import { CalendarBotService } from './service/calendar-bot.service';
import { usersProviders } from './providers/users.providers';
import { MapDiscUserMiddleware } from './middlewares/map-disc-user.middleware';
import { verifyKeyMiddleware } from 'discord-interactions';

@Module({
  imports: [],
  controllers: [CalendarBotController],
  providers: [CalendarBotService, ...usersProviders],
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
