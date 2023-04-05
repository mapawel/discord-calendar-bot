import { Injectable } from '@nestjs/common';
import { DiscordApiService } from 'src/APIs/Discord-api.service';
import { RolesRepository } from './roles.repository';
import { RoleDTO } from '../dto/Role.dto';
import { RolesException } from '../exception/Roles.exception';
import { settings } from '../../app-SETUP/settings';

@Injectable()
export class RolesService {
  constructor(
    private readonly discordApiService: DiscordApiService,
    private readonly rolesRepository: RolesRepository,
  ) {}

  public async getUserRole(userid: string): Promise<string[]> {
    try {
      const {
        data: { roles },
      }: { data: { roles: string[] } } =
        await this.discordApiService.axiosInstance({
          method: 'GET',
          url: `/guilds/${process.env.DISCORD_GUILD_ID}/members/${userid}`,
        });
      return roles;
    } catch (err: any) {
      throw new RolesException(err?.message);
    }
  }

  public async translateRoleNamesToIds(roleNames: string[]): Promise<string[]> {
    const roles: RoleDTO[] = await this.getDBroles();
    return roleNames.map((roleName) => {
      const role = roles.find(
        ({ name }: { name: string }) => name === roleName,
      );
      if (!role) throw new RolesException('Role not found!');
      return role.id;
    });
  }

  public async getDBroles(roleNames: string[] = []): Promise<RoleDTO[]> {
    return await this.rolesRepository.getDBroles(roleNames);
  }

  public async updateAllDBRoles(): Promise<void> {
    try {
      const { data: roles }: { data: RoleDTO[] } =
        await this.discordApiService.axiosInstance({
          method: 'GET',
          url: `/guilds/${process.env.DISCORD_GUILD_ID}/roles`,
        });

      await this.rolesRepository.removeAllDBroles();
      await this.rolesRepository.createBulkBDRoles(roles);
    } catch (err: any) {
      throw new RolesException(err?.message);
    }
  }

  public async checkIfUserIsMeetingHost(dId: string): Promise<boolean> {
    try {
      const userRoles: string[] = await this.getUserRole(dId);
      const rolesUsersCanMeetWith = await this.translateRoleNamesToIds(
        settings.rolesUsersCanMeetWith,
      );
      return userRoles.some((role) => rolesUsersCanMeetWith.includes(role));
    } catch (err: any) {
      throw new RolesException(err?.message);
    }
  }
}
