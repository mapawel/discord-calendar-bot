import { Injectable } from '@nestjs/common';
import { WhitelistedUser } from '../entities/whitelisted-user.entity';
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

  async getFromWhitelist(): Promise<WhitelistedUserDto[]> {
    const foundUsers: WhitelistedUser[] = await WhitelistedUser.findAll();
    return foundUsers.map((user) => whitelistedUserDtoMapper(user));
  }

  async removeFromWhitelist(discordId: string): Promise<boolean> {
    const found: WhitelistedUser | null = await WhitelistedUser.findOne({
      where: { discordId },
    });
    if (!found) return false;

    await found.destroy();
    return true;
  }
}
