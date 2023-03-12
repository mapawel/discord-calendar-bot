import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { verifyKeyMiddleware } from 'discord-interactions';
import { calendarCommands } from './calendar-bot/discord-commands/calendar.commands';
import { DiscordCommands } from './discord-utils/discord-comands';

config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  // app.use(verifyKeyMiddleware(process.env.PUBLIC_KEY || ''));

  new DiscordCommands(calendarCommands).commandsInit();

  await app.listen(6000);
}
bootstrap();
