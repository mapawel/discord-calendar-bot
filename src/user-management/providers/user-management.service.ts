import { Injectable } from '@nestjs/common';
import { UserManagementRepository } from './user-management.repository';
import { AxiosProvider } from 'src/axios/provider/axios.provider';
import { UsersFromDiscordDTO } from '../dto/users-from-discord.dto';
import { WhitelistedUserDto } from '../dto/whitelisted-user.dto';

@Injectable()
export class UserManagementService {
  constructor(
    private readonly userManagementRepository: UserManagementRepository,
    private readonly axiosProvider: AxiosProvider,
  ) {}
  async checkWhitelistedByDiscordId(discordId: string): Promise<boolean> {
    return !!(await this.userManagementRepository.checkOnWhitelist(discordId));
  }

  async getUsersFromDiscord(): Promise<UsersFromDiscordDTO[]> {
    try {
      const { data }: { data: { user: UsersFromDiscordDTO }[] } =
        await this.axiosProvider.instance({
          method: 'GET',
          url: `https://discord.com/api/v10/guilds/${process.env.GUILD_ID}/members?limit=1000`,
        });

      if (!data) throw new Error('No data from Discord trying to get users');

      return data.map((item) => ({
        id: item.user.id,
        username: item.user.username,
      }));
    } catch (err: any) {
      throw new Error(err.message);
    }
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

  async getExistingUsers(): Promise<WhitelistedUserDto[]> {
    return await this.userManagementRepository.getFromWhitelist();
  }

  async removeExistingUsers(discordId: string): Promise<boolean> {
    return await this.userManagementRepository.removeFromWhitelist(discordId);
  }
}
