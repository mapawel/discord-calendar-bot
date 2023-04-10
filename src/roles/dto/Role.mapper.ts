import { Role } from '../entity/Role.entity';
import { RoleDTO } from './Role.dto';

export const RoleMapper = ({ id, name }: Role): RoleDTO => ({
  id,
  name,
});
