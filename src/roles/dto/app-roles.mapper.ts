import { Role } from '../entity/Role.entity';
import { AppRoleDTO } from './App-role.dto';

export const appRoleMapper = (role: Role): AppRoleDTO => ({
  discordid: role.id,
  name: role.name,
});
