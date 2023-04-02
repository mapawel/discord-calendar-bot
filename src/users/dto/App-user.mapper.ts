import { AppUser } from '../entity/App-user.entity';
import { AppUserDTO } from './App-user.dto';

const mapUsersOrMentors = (
  array: AppUser[],
): {
  dId: string;
  username: string;
}[] =>
  array.map(({ dId, username }: { dId: string; username: string }) => ({
    dId,
    username,
  }));

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
  updatedAt: user.updatedAt,
  mentors: user.mentors ? mapUsersOrMentors(user.mentors) : [],
});
