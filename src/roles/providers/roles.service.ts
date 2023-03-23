import { Injectable } from '@nestjs/common';
import { AxiosProvider } from 'src/axios/provider/axios.provider';
import { DiscordRoleDTO } from '../dto/Discord-role.dto';
import { RolesRepository } from './roles.repository';
import { AppRoleDTO } from '../dto/App-role.dto';
import { usersManagementSettings } from 'src/app-SETUP/users-management.settings';

@Injectable()
export class RolesService {
  constructor(
    private readonly axiosProvider: AxiosProvider,
    private readonly rolesRepository: RolesRepository,
  ) {}

  public async getUserRole(userid: string): Promise<string[]> {
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

  public async translateRoleNamesToIds(roleNames: string[]): Promise<string[]> {
    const roles: AppRoleDTO[] = await this.getDBroles();
    return roleNames.map((roleName) => {
      const role = roles.find(
        ({ name }: { name: string }) => name === roleName,
      );
      if (!role) throw new Error('Role not found!');
      return role.discordid;
    });
  }

  public async getDBroles(roleNames: string[] = []): Promise<AppRoleDTO[]> {
    return await this.rolesRepository.getDBroles(roleNames);
  }

  private async updateAllDBroles(): Promise<void> {
    try {
      const { data: roles }: { data: DiscordRoleDTO[] } =
        await this.axiosProvider.instance({
          method: 'GET',
          url: `/guilds/${process.env.GUILD_ID}/roles`,
        });

      await this.rolesRepository.removeAllDBroles();
      await this.rolesRepository.createBulkBDRoles(roles);
    } catch (err: any) {
      throw new Error(err);
      //TODO add a custom error
    }
  }

  async onModuleInit() {
    await this.updateAllDBroles();
  }
}
