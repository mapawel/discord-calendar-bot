import { User } from '../entity/User.entity';
import { UserDTO } from './User.dto';

export const userDtoMapper = (user: User): UserDTO => ({
  id: user.id,
  username: user.username,
  authenticated: user.authenticated,
});
