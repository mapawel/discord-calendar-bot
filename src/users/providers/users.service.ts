import { Injectable } from '@nestjs/common';
import { DiscordUserDTO } from '../../discord-interactions/dto/Discord-user.dto';
import { AppUserDTO } from '../dto/App-user.dto';
import { UsersRepository } from './users.repository';
import { RolesService } from 'src/roles/providers/roles.service';
import { AxiosProvider } from 'src/axios/provider/axios.provider';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly rolesService: RolesService,
    private readonly axiosProvider: AxiosProvider,
  ) {}

  public async createUserIfNotExisting(user: DiscordUserDTO): Promise<boolean> {
    const foundUser: AppUserDTO | undefined =
      await this.usersRepository.getFirstUserByParam('dId', user.id);
    if (foundUser) {
      return false;
      //TODO if existing update username!
    }
    return await this.usersRepository.createUser(user);
  }

  public async updateUser(authUser: AppUserDTO): Promise<boolean> {
    return await this.usersRepository.updateUser(authUser);
  }

  public async updateUserAuthStatus(
    dId: string,
    authenticated: boolean,
  ): Promise<boolean> {
    return await this.usersRepository.updateUserAuthStatus(dId, authenticated);
  }

  public async getUserByDId(dId: string): Promise<AppUserDTO | undefined> {
    return await this.usersRepository.getFirstUserByParam('dId', dId);
  }

  public async checIfUserWhitelisted(dId: string): Promise<boolean> {
    return !!(await this.usersRepository.getWhitelistedUser(dId));
  }

  public async getWhitelistedUser(
    dId: string,
  ): Promise<AppUserDTO | undefined> {
    return await this.usersRepository.getWhitelistedUser(dId);
  }

  public async getUserFromDiscord(dId: string): Promise<DiscordUserDTO> {
    try {
      const {
        data: { user },
      }: { data: { user: DiscordUserDTO } } = await this.axiosProvider.instance(
        {
          method: 'GET',
          url: `/guilds/${process.env.GUILD_ID}/members/${dId}`,
        },
      );

      return user;
    } catch (err: any) {
      throw new Error(err?.message);
      // TODO custom exception
    }
  }

  public async getUsersFromDiscord(
    roles?: string[],
  ): Promise<DiscordUserDTO[]> {
    try {
      const { data }: { data: { roles: string[]; user: DiscordUserDTO }[] } =
        await this.axiosProvider.instance({
          method: 'GET',
          url: `https://discord.com/api/v10/guilds/${process.env.GUILD_ID}/members?limit=1000`,
        });

      if (!data) throw new Error('No data from Discord trying to get users');

      const usersWithRoles: { roles: string[]; user: DiscordUserDTO }[] =
        roles?.length ? this.filterUsersByRole(data, roles) : data;

      return usersWithRoles.map(
        ({
          user: { id, username },
        }: {
          user: { id: string; username: string };
        }) => ({
          id,
          username,
        }),
      );
    } catch (err: any) {
      throw new Error(err?.message);
    }
  }

  private filterUsersByRole(
    data: { roles: string[]; user: DiscordUserDTO }[],
    roles: string[],
  ): {
    roles: string[];
    user: DiscordUserDTO;
  }[] {
    return data.filter((item) => {
      return item.roles.some((role) => roles.includes(role));
    });
  }

  public async updateUserWhitelistStatus(
    dId: string,
    status: boolean,
  ): Promise<boolean> {
    return await this.usersRepository.updateUserWhitelistStatus(dId, status);
  }

  public async getAllUsers(): Promise<AppUserDTO[]> {
    return await this.usersRepository.getAllUsers();
  }

  public async getAllWhitelistedUsers(): Promise<AppUserDTO[]> {
    return await this.usersRepository.getAllWhitelistedUsers();
  }

  public async bindUsers(
    sourceUserDId: string,
    targetUserDId: string,
  ): Promise<any> {
    return await this.usersRepository.bindUsers(sourceUserDId, targetUserDId);
  }

  async onModuleInit() {
    await this.rolesService.updateAllDBRoles();
    // const roleIdsEnableToMeetWith: RoleDTO[] =
    //   await this.rolesService.getDBroles(
    //     usersManagementSettings.rolesUsersCanMeetWith,
    //   );

    const allDiscordUsers: DiscordUserDTO[] = await this.getUsersFromDiscord();

    await this.usersRepository.createOrUpdateAllUsers(allDiscordUsers);
    //TODO add possibility to refresh mentors list from discord
  }
}
