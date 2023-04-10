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

export const AppUserMapper = ({
  dId,
  aId,
  username,
  email,
  authenticated,
  IdP,
  whitelisted,
  name,
  picture,
  updatedAt,
  mentors,
}: AppUser): AppUserDTO => ({
  dId,
  aId,
  username,
  email,
  authenticated,
  IdP,
  whitelisted,
  name,
  picture,
  updatedAt,
  mentors: mentors ? mapUsersOrMentors(mentors) : [],
});
