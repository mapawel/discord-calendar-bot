import { AppUser } from '../entity/App-user.entity';
import { AppUserDTO } from './App-user.dto';

// const mapUsersOrMentors = (
//   array: { id: string; username: string }[],
// ): {
//   id: string;
//   username: string;
// }[] =>
//   array.map(({ id, username }: { id: string; username: string }) => ({
//     id,
//     username,
//   }));

export const AppUserMapper = (user: AppUser): AppUserDTO => ({
  dId: user.dId,
  aId: user.aId,
  username: user.username,
  email: user.email,
  authenticated: user.authenticated,
  IdP: user.IdP,
  whitelisted: user.whitelisted,
  name: user.name,
  picture: user.picture,
  // mentors: mapUsersOrMentors(user.mentors),
});
