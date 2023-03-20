import { Injectable } from '@nestjs/common';
import { WhitelistedUser } from '../entity/whitelisted-user.entity';
import { WhitelistedUserDto } from '../dto/whitelisted-user.dto';
import { whitelistedUserDtoMapper } from '../dto/whitelisted-user-dto.mapper';

@Injectable()
export class UserManagementRepository {
  async checkOnWhitelist(
    discordId: string,
  ): Promise<WhitelistedUserDto | undefined> {
    const found: WhitelistedUser | null = await WhitelistedUser.findOne({
      where: { discordId },
    });
    return found ? whitelistedUserDtoMapper(found) : undefined;
  }

  async addToWhitelist(discordId: string): Promise<true> {
    await WhitelistedUser.create({ discordId });
    return true;
  }
}
