import { Injectable } from '@nestjs/common';
import { DiscordApiService } from '../../APIs/Discord-api.service';
import { commands } from '../../app-SETUP/lists/commands.list';
import { DiscordCommandsException } from '../exception/Discord-commands.exception';
import { AppCommand } from '../../app-SETUP/lists/commands.list';
import { isStatusValid } from '../../APIs/APIs.helpers';
import { AppCommandWithId } from '../types/AppCommandWithId.type';
import { DiscordRequestArgs } from '../types/Discord-request-args.type';

@Injectable()
export class DiscordCommandsService {
  constructor(private readonly discordApiService: DiscordApiService) {}

  public async commandsInit(commands: AppCommand[]): Promise<void> {
    try {
      // const existingCommands = await this.getExistingCommands();
      // console.log('initialized discord commands ----> ', existingCommands);
      // await Promise.all(
      //   existingCommands.map(
      //     async ({ id }: { id: string }) => await this.deleteCommand(id),
      //   ),
      // );
      // await Promise.all(
      //   commands.map(
      //     async (command: AppCommand) => await this.addCommand(command),
      //   ),
      // );
    } catch (err: any) {
      throw new DiscordCommandsException(err?.message, { causeErr: err });
    }
  }

  private async getExistingCommands(): Promise<AppCommandWithId[]> {
    try {
      return await this.discordRequest({
        method: 'GET',
        url: '',
      });
    } catch (err: any) {
      throw new DiscordCommandsException(err?.message, { causeErr: err });
    }
  }

  private async addCommand(command: AppCommand): Promise<void> {
    try {
      await this.discordRequest({
        method: 'POST',
        data: command,
        url: '',
      });
    } catch (err: any) {
      throw new DiscordCommandsException(err?.message, { causeErr: err });
    }
  }

  private async deleteCommand(id: string): Promise<void> {
    try {
      await this.discordRequest({
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
  }: DiscordRequestArgs): Promise<AppCommandWithId[]> {
    try {
      const response = await this.discordApiService.axiosInstance({
        method,
        url: `applications/${process.env.DISCORD_CLIENT_ID}/commands${url}`,
        data,
      });

      if (!isStatusValid(response.status)) {
        throw new Error(`Discord API responded with status ${response.status}`);
      }

      return response?.data;
    } catch (err: any) {
      throw new DiscordCommandsException(err?.message, { causeErr: err });
    }
  }

  async onModuleInit() {
    await this.commandsInit(commands);
  }
}
