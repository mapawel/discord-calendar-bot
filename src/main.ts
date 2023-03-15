import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { calendarCommands } from './calendar-bot/discord-commands/calendar.commands';
import { DiscordCommands } from './discord-utils/discord-comands';
import { auth } from 'express-openid-connect';
import { authConfig } from './authz/config';

config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });
  app.enableCors();

  app.use(auth(authConfig));

  //TODO !!!!!!!!!!!!!!! change to init if not existing due to limit!
  new DiscordCommands(calendarCommands).commandsInit();

  await app.listen(6000);
}
bootstrap();
