import { Module } from '@nestjs/common';
import { DiscordCommandsService } from './discord-commands.service';
import { AxiosModule } from 'src/axios/axios.module';

@Module({
  imports: [AxiosModule],
  providers: [DiscordCommandsService],
  exports: [],
})
export class DiscordCommandsModule {}
