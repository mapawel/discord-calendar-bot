import { Injectable } from '@nestjs/common';
import { DiscordApiService } from 'src/APIs/Discord-api.service';
import { commands } from 'src/app-SETUP/lists/commands.list';
import { DiscordCommandsException } from '../exception/Discord-commands.exception';
import { AppCommand } from 'src/app-SETUP/lists/commands.list';

@Injectable()
export class DiscordCommandsService {
  constructor(private readonly discordApiService: DiscordApiService) {}

  public async commandsInit(commands: AppCommand[]) {
    try {
      //   const existingCommands = await this.getExistingCommands();
      //   console.log('initialized discord commands ----> ', existingCommands);
      //   await Promise.all(
      //     existingCommands.map(
      //       async ({ id }: { id: string }) => await this.deleteCommand(id),
      //     ),
      //   );
      //   await Promise.all(
      //     commands.map(
      //       async (command: AppCommand) => await this.addCommand(command),
      //     ),
      //   );
    } catch (err: any) {
      throw new DiscordCommandsException(err?.message, { causeErr: err });
    }
  }

  private async getExistingCommands() {
    try {
      return await this.discordRequest({
        method: 'GET',
        url: '',
      });
    } catch (err: any) {
      throw new DiscordCommandsException(err?.message, { causeErr: err });
    }
  }

  private async addCommand(command: AppCommand) {
    try {
      return await this.discordRequest({
        method: 'POST',
        data: command,
        url: '',
      });
    } catch (err: any) {
      throw new DiscordCommandsException(err?.message, { causeErr: err });
    }
  }

  private async deleteCommand(id: string) {
    try {
      return await this.discordRequest({
        method: 'DELETE',
        url: `/${id}`,
      });
    } catch (err: any) {
      throw new DiscordCommandsException(err?.message, { causeErr: err });
    }
  }

  private async discordRequest({
    method,
    data,
    url,
  }: {
    method: 'GET' | 'POST' | 'DELETE';
    data?: AppCommand;
    url?: string;
  }): Promise<AppCommand & { id: string }[]> {
    try {
      const response = await this.discordApiService.axiosInstance({
        method,
        url: `applications/${process.env.DISCORD_CLIENT_ID}/commands${url}`,
        data,
      });

      return response?.data;
    } catch (err: any) {
      throw new DiscordCommandsException(err?.message, { causeErr: err });
    }
  }

  async onModuleInit() {
    await this.commandsInit(commands);
  }
}
