import { Injectable } from '@nestjs/common';
import { AxiosProvider } from 'src/axios/provider/axios.provider';
import { config } from 'dotenv';
import { commands } from 'src/app-SETUP/lists/commands.list';
import { DiscordCommandsException } from '../exception/Discord-commands.exception';

config();

@Injectable()
export class DiscordCommandsService {
  constructor(private readonly axiosProvider: AxiosProvider) {}

  public async commandsInit(commands: any[]) {
    // const existingCommands = await this.getExistingCommands();
    // console.log('existingCommands ----> ', existingCommands);
    // await Promise.all(
    //   existingCommands.map(async ({ id }: { id: string }) => {
    //     return await this.deleteCommand(id);
    //   }),
    // );
    // await Promise.all(
    //   commands.map(async (command: any) => {
    //     return await this.addCommand(command);
    //   }),
    // );
  }

  private async getExistingCommands() {
    return await this.discordRequest({
      method: 'GET',
      url: '',
    });
  }

  private async addCommand(command: any) {
    return await this.discordRequest({
      method: 'POST',
      data: command,
      url: '',
    });
  }

  private async deleteCommand(id: string) {
    return await this.discordRequest({
      method: 'DELETE',
      url: `/${id}`,
    });
  }

  private async discordRequest({
    method,
    data,
    url,
  }: {
    method: 'GET' | 'POST' | 'DELETE';
    data?: any;
    url?: string;
  }): Promise<any> {
    try {
      const response = await this.axiosProvider.axiosDiscordAPI({
        method,
        url: `applications/${process.env.APP_ID}/commands${url}`,
        data,
      });

      return response?.data;
    } catch (err: any) {
      throw new DiscordCommandsException(err?.message);
    }
  }

  async onModuleInit() {
    await this.commandsInit(commands);
  }
}
