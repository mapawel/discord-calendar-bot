import { Module } from '@nestjs/common';
import { DiscordCommandsService } from './discord-commands.service';
import { commands } from './commands.list';
import { AxiosModule } from 'src/axios/axios.module';
import { AxiosProvider } from 'src/axios/axios.provider';

@Module({
  imports: [AxiosModule],
  providers: [
    {
      provide: DiscordCommandsService,
      useValue: new DiscordCommandsService(new AxiosProvider()).commandsInit(
        commands,
      ),
    },
  ],
  exports: [DiscordCommandsService],
})
export class DiscordCommandsModule {}
