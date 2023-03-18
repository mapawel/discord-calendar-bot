import { Injectable } from '@nestjs/common';
import { RoleDTO } from '../dto/Role.dto';
import { Role } from '../entity/Role.entity';

@Injectable()
export class RoleDBoperationsProvider {
  public async removeAllDBroles() {
    await Role.destroy({
      where: {},
      truncate: true,
    });
  }

  public async createBulkBDRoles(roles: RoleDTO[]) {
    await Role.bulkCreate(
      roles.map(({ id, name }: RoleDTO) => ({ roleId: id, name }), {
        updateOnDuplicate: ['name'],
      }),
    );
  }
}
