import { NotFoundException, Injectable } from '@nestjs/common';
import { DiscordUserDTO } from '../../discord-interactions/dto/Discord-user.dto';
import { AppUserDTO } from '../dto/App-user.dto';
import { UsersRepository } from './users.repository';
import { RolesService } from '../../roles/providers/roles.service';
import { DiscordApiService } from '../../APIs/Discord-api.service';
import { AuthzUserDTO } from '../../authz/dto/Auth-user.dto';
import { UsersServiceException } from '../exception/Users-service.exception';
import { HostCalendar } from '../../Host-calendar/entity/Host-calendar.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly rolesService: RolesService,
    private readonly discordApiService: DiscordApiService,
  ) {}

  public async createUserIfNotExisting(user: DiscordUserDTO): Promise<boolean> {
    try {
      const foundUser: AppUserDTO | undefined =
        await this.usersRepository.getFirstUserByParam('dId', user.id);
      if (foundUser) {
        return false;
      }
      return await this.usersRepository.createUser(user);
    } catch (err: any) {
      throw new UsersServiceException(err?.message, { causeErr: err });
    }
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
    try {
      return await this.usersRepository.getFirstUserByParam('dId', dId);
    } catch (err: any) {
      throw new UsersServiceException(err?.message, { causeErr: err });
    }
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
      }: { data: { user: DiscordUserDTO } } =
        await this.discordApiService.axiosInstance({
          method: 'GET',
          url: `/guilds/${process.env.DISCORD_GUILD_ID}/members/${dId}`,
        });
      if (!user) throw new NotFoundException('User not found on Discord');

      return user;
    } catch (err: any) {
      if (err?.response?.status === 404) {
        throw new NotFoundException('User not found on Discord');
      }
      throw new UsersServiceException(err?.message, { causeErr: err });
    }
  }

  public async getUsersFromDiscord(
    roleNames?: string[],
  ): Promise<DiscordUserDTO[]> {
    try {
      const { data }: { data: { roles: string[]; user: DiscordUserDTO }[] } =
        await this.discordApiService.axiosInstance({
          method: 'GET',
          url: `https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID}/members?limit=1000`,
        });

      if (!data) throw new Error('No requested data found on Discord');

      const roles: string[] = await this.rolesService.translateRoleNamesToIds(
        roleNames || [],
      );

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
      if (err?.response?.status === 404) {
        throw new NotFoundException('Requested data not found on Discord');
      }
      throw new UsersServiceException(err?.message, { causeErr: err });
    }
  }

  public getFullAppUser(
    verifiedUser: AppUserDTO,
    authUserData: AuthzUserDTO,
  ): AppUserDTO {
    return {
      ...verifiedUser,
      name: authUserData.name,
      picture: authUserData.picture,
      authenticated: true,
      IdP: authUserData.sub.split('|')[0],
      aId: authUserData.sub,
      email: authUserData.email,
    };
  }

  public async takeAndValidateUserAndHost({
    userDId,
    hostDId,
  }: {
    userDId: string;
    hostDId: string;
  }) {
    try {
      let error: string | undefined;
      const [user, host]: (AppUserDTO | undefined)[] = await Promise.all(
        [userDId, hostDId].map((dId) => this.getUserByDId(dId)),
      );

      if (!user || !host) {
        throw Error('User or host not found');
      }

      const usersCalendar: HostCalendar | null = await HostCalendar.findByPk(
        hostDId,
      );
      if (!usersCalendar)
        error =
          "Host didn't auth the app and connect his calander yet. Let him know about this fact to book a meeting!";

      return { user, host, error };
    } catch (err: any) {
      throw new UsersServiceException(err?.message, { causeErr: err });
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
    maxMentors?: number,
  ): Promise<{ error: string }> {
    try {
      return await this.usersRepository.bindUsers(
        sourceUserDId,
        targetUserDId,
        maxMentors,
      );
    } catch (err: any) {
      throw new UsersServiceException(err?.message, { causeErr: err });
    }
  }

  async onModuleInit() {
    await this.rolesService.updateAllDBRoles();

    // to decide by business
    // const allDiscordUsers: DiscordUserDTO[] = await this.getUsersFromDiscord();
    // await this.usersRepository.createOrUpdateAllUsers(allDiscordUsers);
  }
}
