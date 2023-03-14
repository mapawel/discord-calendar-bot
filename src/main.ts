import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { calendarCommands } from './calendar-bot/discord-commands/calendar.commands';
import { DiscordCommands } from './discord-utils/discord-comands';
import * as session from 'express-session';
const passport = require('passport');

config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  if (!process.env.SESSION_SECRET)
    throw new Error('SESSION_SECRET is not defined!');

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    }),
  );

  //TODO !!!!!!!!!!!!!!! change to init if not existing due to limit!
  new DiscordCommands(calendarCommands).commandsInit();

  await app.listen(6000);
}
bootstrap();
