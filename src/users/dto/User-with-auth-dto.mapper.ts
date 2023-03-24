import { UserWithAuthDTO } from './User-with-auth.dto';
import { UserWithAuth } from '../entity/User-with-auth.entity';

export const UserWithAuthMapper = (user: UserWithAuth): UserWithAuthDTO => ({
  id: user.id,
  username: user.username,
  authenticated: user.authenticated,
});
