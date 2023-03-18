import { Injectable } from '@nestjs/common';
import { AxiosProvider } from 'src/axios/axios.provider';
import { config } from 'dotenv';
import { commands } from './commands.list';

config();

@Injectable()
export class DiscordCommandsService {
  constructor(private readonly axiosProvider: AxiosProvider) {}
  //TODO ask SEBASTIAN about DI! I have access to the axiosProvider here if I import MODULE and it's not nesessary to import PROVIDER but I have to because I want to create CiscordCommandsService instance to fire init method

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
      const response = await this.axiosProvider.instance({
        method,
        url: `applications/${process.env.APP_ID}/commands${url}`,
        data,
      });

      return response?.data;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async onModuleInit() {
    await this.commandsInit(commands);
  }
}
