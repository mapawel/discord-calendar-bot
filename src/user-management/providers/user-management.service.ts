import { Injectable } from '@nestjs/common';
import { UserManagementRepository } from './user-management.repository';
import { AxiosProvider } from 'src/axios/provider/axios.provider';
import { UsersFromDiscordDTO } from '../dto/users-from-discord.dto';
import { WhitelistedUserDto } from '../dto/whitelisted-user.dto';
import { RolesService } from 'src/roles/providers/roles.service';
import { AppRoleDTO } from 'src/roles/dto/App-role.dto';
import { usersManagementSettings } from 'src/app-SETUP/users-management.settings';
import { MentorUser } from '../entities/mentor-user.entity';

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

  public async getUserFromDiscord(
    discordId: string,
  ): Promise<UsersFromDiscordDTO> {
    try {
      const {
        data: { user },
      }: { data: { user: UsersFromDiscordDTO } } =
        await this.axiosProvider.instance({
          method: 'GET',
          url: `/guilds/${process.env.GUILD_ID}/members/${discordId}`,
        });

      return user;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  public async getUsersFromDiscord(
    roles?: string[],
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

      const users: { roles: string[]; user: UsersFromDiscordDTO }[] =
        roles?.length ? this.filterUsersByRole(data, roles) : data;

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
    roles: string[],
  ): {
    roles: string[];
    user: UsersFromDiscordDTO;
  }[] {
    return data.filter((item) => {
      return item.roles.some((role) => roles.includes(role));
    });
  }

  public async addToWhitelistIdNotExisting(
    discordId: string,
    username: string,
  ): Promise<boolean> {
    const isExisting: boolean = await this.checkWhitelistedByDiscordId(
      discordId,
    );
    if (isExisting) {
      return false;
    }
    return await this.userManagementRepository.addToWhitelist(
      discordId,
      username,
    );
  }

  public async getExistingUsers(): Promise<WhitelistedUserDto[]> {
    return await this.userManagementRepository.getFromWhitelist();
  }

  public async removeExistingUsers(discordId: string): Promise<boolean> {
    return await this.userManagementRepository.removeFromWhitelist(discordId);
  }

  public async getMentors(): Promise<MentorUser[]> {
    return await this.userManagementRepository.getMentors();
  }

  async onModuleInit() {
    await this.rolesService.updateAllDBroles();
    const roleIdsEnableToMeetWith: AppRoleDTO[] =
      await this.rolesService.getDBroles(
        usersManagementSettings.rolesUsersCanMeetWith,
      );

    const usersEnableToMeetWith: UsersFromDiscordDTO[] =
      await this.getUsersFromDiscord(
        roleIdsEnableToMeetWith.map(
          ({ discordid }: { discordid: string }) => discordid,
        ),
      );

    await this.userManagementRepository.createOrUpdateMentors(
      usersEnableToMeetWith.map(({ id }: { id: string }) => id),
    );
    //TODO add possibility to refresh mentors list from discord
  }
}
