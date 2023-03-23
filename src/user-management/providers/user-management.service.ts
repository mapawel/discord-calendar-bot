import { Injectable } from '@nestjs/common';
import { UserManagementRepository } from './user-management.repository';
import { AxiosProvider } from 'src/axios/provider/axios.provider';
import { UsersFromDiscordDTO } from '../dto/users-from-discord.dto';
import { WhitelistedUserDto } from '../dto/whitelisted-user.dto';
import { RolesService } from 'src/roles/providers/roles.service';

@Injectable()
export class UserManagementService {
  constructor(
    private readonly userManagementRepository: UserManagementRepository,
    private readonly axiosProvider: AxiosProvider,
    private readonly rolesService: RolesService,
  ) {}
  public async checkWhitelistedByDiscordId(
    discordId: string,
  ): Promise<boolean> {
    return !!(await this.userManagementRepository.checkOnWhitelist(discordId));
  }

  public async getUsersFromDiscord(
    role?: string,
  ): Promise<UsersFromDiscordDTO[]> {
    try {
      const {
        data,
      }: { data: { roles: string[]; user: UsersFromDiscordDTO }[] } =
        await this.axiosProvider.instance({
          method: 'GET',
          url: `https://discord.com/api/v10/guilds/${process.env.GUILD_ID}/members?limit=1000`,
        });

      if (!data) throw new Error('No data from Discord trying to get users');

      const users: { roles: string[]; user: UsersFromDiscordDTO }[] = role
        ? this.filterUsersByRole(data, role)
        : data;

      return users.map((item) => ({
        id: item.user.id,
        username: item.user.username,
      }));
    } catch (err: any) {
      throw new Error(err.message);
    }
  }

  private filterUsersByRole(
    data: { roles: string[]; user: UsersFromDiscordDTO }[],
    role: string,
  ): {
    roles: string[];
    user: UsersFromDiscordDTO;
  }[] {
    return data.filter((item) => {
      return item.roles.includes(role);
    });
  }

  public async addToWhitelistIdNotExisting(
    discordId: string,
  ): Promise<boolean> {
    const isExisting: boolean = await this.checkWhitelistedByDiscordId(
      discordId,
    );
    if (isExisting) {
      return false;
    }
    return await this.userManagementRepository.addToWhitelist(discordId);
  }

  public async getExistingUsers(): Promise<WhitelistedUserDto[]> {
    return await this.userManagementRepository.getFromWhitelist();
  }

  public async removeExistingUsers(discordId: string): Promise<boolean> {
    return await this.userManagementRepository.removeFromWhitelist(discordId);
  }
}
