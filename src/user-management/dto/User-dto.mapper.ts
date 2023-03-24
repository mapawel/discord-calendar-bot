import { UserDTO } from './User.dto';
import { Mentor } from '../entities/Mentor.entity';
import { WhitelistedUser } from '../entities/Whitelisted-user.entity';

export const UserDTOMapper = (user: WhitelistedUser | Mentor): UserDTO => ({
  id: user.id,
  username: user.username,
});
