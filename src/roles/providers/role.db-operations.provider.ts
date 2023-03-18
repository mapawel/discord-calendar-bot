import { Injectable } from '@nestjs/common';
import { DiscordRoleDTO } from '../dto/Discord-role.dto';
import { AppRoleDTO } from '../dto/App-role.dto';
import { Role } from '../entity/Role.entity';
import { appRoleMapper } from '../dto/app-roles.mapper';

@Injectable()
export class RoleDBoperationsProvider {
  public async removeAllDBroles(): Promise<void> {
    await Role.destroy({
      where: {},
      truncate: true,
    });
  }

  public async getDBroles(): Promise<AppRoleDTO[]> {
    const roles: Role[] = await Role.findAll();
    return roles.map((role) => appRoleMapper(role));
  }

  public async createBulkBDRoles(roles: DiscordRoleDTO[]): Promise<void> {
    await Role.bulkCreate(
      roles.map(({ id, name }: DiscordRoleDTO) => ({ roleId: id, name }), {
        updateOnDuplicate: ['name'],
      }),
    );
  }
}

// TODO the same for USER
