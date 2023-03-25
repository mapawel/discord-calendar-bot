import { UserDTO } from './User.dto';
import { Mentor } from '../entities/Mentor.entity';
import { WhitelistedUser } from '../entities/Whitelisted-user.entity';

const mapUsersOrMentors = (
  array: { id: string; username: string }[],
): {
  id: string;
  username: string;
}[] =>
  array.map(({ id, username }: { id: string; username: string }) => ({
    id,
    username,
  }));

export const UserDTOMapper = (user: WhitelistedUser | Mentor): UserDTO => ({
  id: user.id,
  username: user.username,
  connections:
    user instanceof WhitelistedUser
      ? mapUsersOrMentors(user.mentors)
      : mapUsersOrMentors(user.users),
});
