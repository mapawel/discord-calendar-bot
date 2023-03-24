import { Injectable } from '@nestjs/common';
import { RoleDTO } from '../dto/Role.dto';
import { Role } from '../entity/Role.entity';
import { RoleMapper } from '../dto/Role.mapper';
import { DBException } from 'src/db/exception/DB.exception';

@Injectable()
export class RolesRepository {
  public async removeAllDBroles(): Promise<void> {
    try {
      await Role.destroy({
        where: {},
        truncate: true,
      });
    } catch (err: any) {
      throw new DBException(err?.message);
    }
  }

  public async getDBroles(roleNames: string[]): Promise<RoleDTO[]> {
    try {
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
    } catch (err: any) {
      throw new DBException(err?.message);
    }
  }

  public async createBulkBDRoles(roles: RoleDTO[]): Promise<void> {
    try {
      await Role.bulkCreate(
        roles.map(({ id, name }: RoleDTO) => ({ id, name }), {
          updateOnDuplicate: ['name'],
        }),
      );
    } catch (err: any) {
      throw new DBException(err?.message);
    }
  }
}
