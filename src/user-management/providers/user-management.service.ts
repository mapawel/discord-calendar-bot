import { Injectable } from '@nestjs/common';
import { UserManagementRepository } from './user-management.repository';
import { AxiosProvider } from '../../axios/provider/axios.provider';
import { UserDTO } from '../dto/User.dto';
import { RolesService } from '../../roles/providers/roles.service';
import { RoleDTO } from '../../roles/dto/Role.dto';
import { usersManagementSettings } from '../../app-SETUP/users-management.settings';

@Injectable()
export class UserManagementService {
  constructor(
    private readonly userManagementRepository: UserManagementRepository,
    private readonly axiosProvider: AxiosProvider,
    private readonly rolesService: RolesService,
  ) {}
  public async checkWhitelistedById(id: string): Promise<boolean> {
    return !!(await this.userManagementRepository.checkOnWhitelist(id));
  }

  public async getUserFromDiscord(id: string): Promise<UserDTO> {
    try {
      const {
        data: { user },
      }: { data: { user: UserDTO } } = await this.axiosProvider.instance({
        method: 'GET',
        url: `/guilds/${process.env.GUILD_ID}/members/${id}`,
      });

      return user;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  public async getUsersFromDiscord(roles?: string[]): Promise<UserDTO[]> {
    try {
      const { data }: { data: { roles: string[]; user: UserDTO }[] } =
        await this.axiosProvider.instance({
          method: 'GET',
          url: `https://discord.com/api/v10/guilds/${process.env.GUILD_ID}/members?limit=1000`,
        });

      if (!data) throw new Error('No data from Discord trying to get users');

      const users: { roles: string[]; user: UserDTO }[] = roles?.length
        ? this.filterUsersByRole(data, roles)
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
    data: { roles: string[]; user: UserDTO }[],
    roles: string[],
  ): {
    roles: string[];
    user: UserDTO;
  }[] {
    return data.filter((item) => {
      return item.roles.some((role) => roles.includes(role));
    });
  }

  public async addToWhitelistIdNotExisting(
    id: string,
    username: string,
  ): Promise<boolean> {
    const isExisting: boolean = await this.checkWhitelistedById(id);
    if (isExisting) {
      return false;
    }
    return await this.userManagementRepository.addToWhitelist(id, username);
  }

  public async getExistingUsers(): Promise<UserDTO[]> {
    return await this.userManagementRepository.getFromWhitelist();
  }

  public async removeExistingUsers(id: string): Promise<boolean> {
    return await this.userManagementRepository.removeFromWhitelist(id);
  }

  public async getMentors(): Promise<UserDTO[]> {
    return await this.userManagementRepository.getMentors();
  }

  public async bindUserToMentor(
    userId: string,
    mentorId: string,
  ): Promise<any> {
    return await this.userManagementRepository.bindUserToMentor(
      userId,
      mentorId,
    );
  }

  async onModuleInit() {
    await this.rolesService.updateAllDBroles();
    const roleIdsEnableToMeetWith: RoleDTO[] =
      await this.rolesService.getDBroles(
        usersManagementSettings.rolesUsersCanMeetWith,
      );

    const usersEnableToMeetWith: UserDTO[] = await this.getUsersFromDiscord(
      roleIdsEnableToMeetWith.map(({ id }: { id: string }) => id),
    );

    await this.userManagementRepository.createOrUpdateMentors(
      usersEnableToMeetWith,
    );
    //TODO add possibility to refresh mentors list from discord
  }
}
