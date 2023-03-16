import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { commands } from './calendar-bot/discord-commands/commands.list';
import { DiscordCommands } from './calendar-bot/discord-commands/comands.service';

config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });
  app.enableCors();

  //TODO !!!!!!!!!!!!!!! change to init if not existing due to limit!
  // new DiscordCommands(commands).commandsInit();

  await app.listen(6000);
}
bootstrap();

//TODO all routes to enum, try catch all DB operations, authz controller - logic to service + BD DI provider!
