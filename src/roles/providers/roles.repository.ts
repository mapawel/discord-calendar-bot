import { Injectable } from '@nestjs/common';
import { RoleDTO } from '../dto/Role.dto';
import { Role } from '../entity/Role.entity';
import { RoleMapper } from '../dto/Role.mapper';

@Injectable()
export class RolesRepository {
  public async removeAllDBroles(): Promise<void> {
    await Role.destroy({
      where: {},
      truncate: true,
    });
  }

  public async getDBroles(roleNames: string[]): Promise<RoleDTO[]> {
    const roles = await Role.findAll(
      roleNames.length
        ? {
            where: {
              name: roleNames,
            },
          }
        : {},
    );
    return roles.map((role) => RoleMapper(role));
  }

  public async createBulkBDRoles(roles: RoleDTO[]): Promise<void> {
    await Role.bulkCreate(
      roles.map(({ id, name }: RoleDTO) => ({ id, name }), {
        updateOnDuplicate: ['name'],
      }),
    );
  }
}
