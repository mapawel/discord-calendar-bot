import { WhitelistedUser } from '../entity/whitelisted-user.entity';
import { WhitelistedUserDto } from './whitelisted-user.dto';

export const whitelistedUserDtoMapper = (
  whitelistedUser: WhitelistedUser,
): WhitelistedUserDto => ({
  discordId: whitelistedUser.discordId,
});
