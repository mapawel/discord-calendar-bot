import { Injectable } from '@nestjs/common';
import { AxiosProvider } from 'src/axios/axios.provider';

@Injectable()
export class RolesProvider {
  constructor(private readonly axiosProvider: AxiosProvider) {}

  async getServerRoles() {
    try {
      const { data: data2 } = await this.axiosProvider.instance({
        method: 'GET',
        url: `/guilds/${process.env.GUILD_ID}/roles`,
      });

      console.log('data2 ----> ', data2);
    } catch (err: any) {
      throw new Error(err);
      //TODO add a custom error
    }
  }
  async getUserRole(userid: string): Promise<string[]> {
    try {
      const {
        data: { roles },
      } = await this.axiosProvider.instance({
        method: 'GET',
        url: `/guilds/${process.env.GUILD_ID}/members/${userid}`,
      });

      return roles;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  onModuleInit() {
    this.getServerRoles();
  }
}
