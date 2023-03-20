import { Injectable } from '@nestjs/common';
import { UserManagementRepository } from './user-management.repository';

@Injectable()
export class UserManagementService {
  constructor(
    private readonly userManagementRepository: UserManagementRepository,
  ) {}
  async checkWhitelistedByDiscordId(discordId: string): Promise<boolean> {
    return !!(await this.userManagementRepository.checkOnWhitelist(discordId));
  }

  async addToWhitelistIdNotExisting(discordId: string): Promise<boolean> {
    const isExisting: boolean = await this.checkWhitelistedByDiscordId(
      discordId,
    );
    if (isExisting) {
      return false;
    }
    return await this.userManagementRepository.addToWhitelist(discordId);
  }
}
