import { Module } from '@nestjs/common';
import { DiscordCommandsService } from './service/discord-commands.service';
import { ApisModule } from 'src/APIs/APIs.module';

@Module({
  imports: [ApisModule],
  providers: [DiscordCommandsService],
  exports: [],
})
export class DiscordCommandsModule {}
