import { Injectable } from '@nestjs/common';
import { AxiosProvider } from 'src/axios/axios.provider';
import { Role } from '../entity/Role.entity';
import { RoleDTO } from '../dto/Role.dto';
import { RoleDBoperationsProvider } from './role.db-operations.provider';

@Injectable()
export class RolesProvider {
  constructor(
    private readonly axiosProvider: AxiosProvider,
    private readonly roleDBoperationsProvider: RoleDBoperationsProvider,
  ) {}

  async getServerRoles() {
    try {
      const { data: roles }: { data: RoleDTO[] } =
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
