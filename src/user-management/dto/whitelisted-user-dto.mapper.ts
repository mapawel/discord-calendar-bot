import { WhitelistedUser } from '../entities/whitelisted-user.entity';
import { WhitelistedUserDto } from './whitelisted-user.dto';

export const whitelistedUserDtoMapper = (
  whitelistedUser: WhitelistedUser,
): WhitelistedUserDto => ({
  discordId: whitelistedUser.discordId,
});
