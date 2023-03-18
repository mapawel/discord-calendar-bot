import { Injectable } from '@nestjs/common';
import { AxiosProvider } from 'src/axios/axios.provider';
import { DiscordRoleDTO } from '../dto/Discord-role.dto';
import { RoleDBoperationsProvider } from './role.db-operations.provider';
import { AppRoleDTO } from '../dto/App-role.dto';

@Injectable()
export class RolesProvider {
  constructor(
    private readonly axiosProvider: AxiosProvider,
    private readonly roleDBoperationsProvider: RoleDBoperationsProvider,
  ) {}

  private async updateAllDBroles(): Promise<void> {
    try {
      const { data: roles }: { data: DiscordRoleDTO[] } =
        await this.axiosProvider.instance({
          method: 'GET',
          url: `/guilds/${process.env.GUILD_ID}/roles`,
        });

      await this.roleDBoperationsProvider.removeAllDBroles();
      await this.roleDBoperationsProvider.createBulkBDRoles(roles);
    } catch (err: any) {
      throw new Error(err);
      //TODO add a custom error
    }
  }

  async getDBroles(): Promise<AppRoleDTO[]> {
    return await this.roleDBoperationsProvider.getDBroles();
  }

  async getUserRole(userid: string): Promise<string[]> {
    try {
      const {
        data: { roles },
      }: { data: { roles: string[] } } = await this.axiosProvider.instance({
        method: 'GET',
        url: `/guilds/${process.env.GUILD_ID}/members/${userid}`,
      });

      return roles;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  onModuleInit() {
    this.updateAllDBroles();
  }
}
