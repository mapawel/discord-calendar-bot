import { User } from '../entity/User.entity';
import { UserDto } from './user.dto';

export const userDtoMapper = (user: User): UserDto => ({
  id: user.id,
  username: user.name,
  authenticated: user.authenticated,
});
