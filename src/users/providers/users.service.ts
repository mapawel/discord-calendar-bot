import { Injectable } from '@nestjs/common';
import { DiscordUserDTO } from '../../discord-interactions/dto/Discord-user.dto';
import { AppUserDTO } from '../dto/App-user.dto';
import { UsersRepository } from './users.repository';
import { RolesService } from 'src/roles/providers/roles.service';
import { DiscordApiService } from 'src/APIs/Discord-api.service';
import { AuthzUserDTO } from 'src/discord-interactions/dto/Auth-user.dto';
import { UsersException } from '../exception/Users.exception';
import { Calendar } from 'src/Calendar/entity/Calendar.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly rolesService: RolesService,
    private readonly discordApiService: DiscordApiService,
  ) {}

  public async createUserIfNotExisting(user: DiscordUserDTO): Promise<boolean> {
    const foundUser: AppUserDTO | undefined =
      await this.usersRepository.getFirstUserByParam('dId', user.id);
    if (foundUser) {
      return false;
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
      }: { data: { user: DiscordUserDTO } } =
        await this.discordApiService.axiosInstance({
          method: 'GET',
          url: `/guilds/${process.env.GUILD_ID}/members/${dId}`,
        });

      return user;
    } catch (err: any) {
      console.log('err ----> ', err);
      throw new UsersException(err?.message);
    }
  }

  public async getUsersFromDiscord(
    roles?: string[],
  ): Promise<DiscordUserDTO[]> {
    try {
      const { data }: { data: { roles: string[]; user: DiscordUserDTO }[] } =
        await this.discordApiService.axiosInstance({
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
      throw new UsersException(err?.message);
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
    let error: string | undefined;
    const [user, host]: (AppUserDTO | undefined)[] = await Promise.all(
      [userDId, hostDId].map((dId) => this.getUserByDId(dId)),
    );

    if (!user || !host) {
      throw Error('User or host not found');
    }

    const usersCalendar: Calendar | null = await Calendar.findByPk(hostDId);
    if (!usersCalendar)
      error =
        "Host didn't auth the app and connect his calander yet. Let him know about this fact to book a meeting!";

    return { user, host, error };
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
    return await this.usersRepository.bindUsers(
      sourceUserDId,
      targetUserDId,
      maxMentors,
    );
  }

  async onModuleInit() {
    await this.rolesService.updateAllDBRoles();

    const allDiscordUsers: DiscordUserDTO[] = await this.getUsersFromDiscord();

    // await this.usersRepository.createOrUpdateAllUsers(allDiscordUsers);
    //TODO add possibility to refresh mentors list from discord
  }
}
