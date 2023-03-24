import { Role } from '../entity/Role.entity';
import { RoleDTO } from './Role.dto';

export const RoleMapper = (role: Role): RoleDTO => ({
  id: role.id,
  name: role.name,
});
