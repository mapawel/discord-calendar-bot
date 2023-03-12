import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export class DiscordCommands {
  axiosInstance: AxiosInstance;

  constructor(private readonly commands: any[], config?: AxiosRequestConfig) {
    this.axiosInstance = axios.create(
      config || {
        baseURL: `https://discord.com/api/v10/applications/${process.env.APP_ID}/commands`,
        headers: {
          Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
          'Content-Type': 'application/json; charset=UTF-8',
          'User-Agent':
            'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)',
        },
      },
    );
  }

  public async commandsInit() {
    const existingCommands = await this.getExistingCommands();

    // const tokenResponse = await axios({
    //   method: 'POST',
    //   url: 'https://discord.com/api/oauth2/token',
    //   data: {
    //     client_id: process.env.CLIENT_ID,
    //     client_secret: process.env.CLIENT_SECRET,
    //     grant_type: 'client_credentials',
    //     scope: 'applications.commands',
    //   },
    //   headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //   },
    // });

    // console.log('to ----> ', tokenResponse?.data.access_token);

    await Promise.all(
      existingCommands.map(async ({ id }: { id: string }) => {
        return await this.deleteCommand(id);
      }),
    );
    await Promise.all(
      this.commands.map(async (command: any) => {
        return await this.addCommand(command);
      }),
    );
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
      url: id,
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
    const response = await this.axiosInstance({
      method,
      url,
      data,
    });

    return response?.data;
  }
}
