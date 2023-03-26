import { Injectable } from '@nestjs/common';
import { AppUser } from '../entity/App-user.entity';
import { AppUserDTO } from '../dto/App-user.dto';
import { AppUserMapper } from '../dto/App-user.mapper';
import { DiscordUserDTO } from 'src/discord-interactions/dto/Discord-user.dto';
import { DBException } from 'src/db/exception/DB.exception';

@Injectable()
export class UsersRepository {
  public async getFirstUserByParam(
    by: keyof AppUser,
    param: string,
  ): Promise<AppUserDTO | undefined> {
    try {
      const found: AppUser | null = await AppUser.findOne({
        where: { [by]: param },
      });
      return found ? AppUserMapper(found) : undefined;
    } catch (err: any) {
      throw new DBException(err?.message);
    }
  }

  public async createUser(user: DiscordUserDTO): Promise<true> {
    try {
      await AppUser.create({
        dId: user.id,
        username: user.username,
      });
      return true;
    } catch (err: any) {
      throw new DBException(err?.message);
    }
  }

  public async updateUser(user: AppUserDTO): Promise<true> {
    try {
      await AppUser.update(
        {
          aId: user.aId,
          username: user.username,
          email: user.email,
          authenticated: user.authenticated,
          IdP: user.IdP,
          whitelisted: user.whitelisted,
        },
        { where: { dId: user.dId } },
      );

      return true;
    } catch (err: any) {
      throw new DBException(err?.message);
    }
  }

  public async updateUserAuthStatus(
    dId: string,
    authenticated: boolean,
  ): Promise<true> {
    try {
      await AppUser.update({ authenticated }, { where: { dId } });
      return true;
    } catch (err: any) {
      throw new DBException(err?.message);
    }
  }

  public async getAllUsers(): Promise<AppUserDTO[]> {
    try {
      const found: AppUser[] = await AppUser.findAll();
      return found.map((user) => AppUserMapper(user));
    } catch (err: any) {
      throw new DBException(err?.message);
    }
  }

  public async getWhitelistedUser(
    dId: string,
  ): Promise<AppUserDTO | undefined> {
    try {
      const found: AppUser | null = await AppUser.findOne({
        where: { dId, whitelisted: true },
      });
      return found ? AppUserMapper(found) : undefined;
    } catch (err: any) {
      throw new DBException(err?.message);
    }
  }

  public async updateUserWhitelistStatus(
    dId: string,
    whitelisted: boolean,
  ): Promise<true> {
    try {
      await AppUser.update({ whitelisted }, { where: { dId } });
      return true;
    } catch (err: any) {
      throw new DBException(err?.message);
    }
  }

  public async getAllWhitelistedUsers(): Promise<AppUserDTO[]> {
    try {
      const found: AppUser[] = await AppUser.findAll({
        where: { whitelisted: true },
      });
      return found.map((user) => AppUserMapper(user));
    } catch (err: any) {
      throw new DBException(err?.message);
    }
  }

  public async createOrUpdateAllUsers(
    allDiscordUsers: DiscordUserDTO[],
  ): Promise<void> {
    try {
      const allAppUsers: AppUser[] = await AppUser.findAll();

      const newUsers: DiscordUserDTO[] = allDiscordUsers.filter(
        ({ id }: { id: string }) =>
          !allAppUsers.some(({ dId }: { dId: string }) => dId === id),
      );

      const appUsersToDelete: AppUser[] = allAppUsers.filter(
        ({ dId }: { dId: string }) =>
          !allDiscordUsers.some(({ id }: { id: string }) => id === dId),
      );

      await AppUser.bulkCreate(
        newUsers.map(({ id, username }: { id: string; username: string }) => ({
          dId: id,
          username,
        })),
      );

      await AppUser.destroy({
        where: {
          dId: appUsersToDelete.map(({ dId }: { dId: string }) => dId),
        },
      });
    } catch (err: any) {
      throw new DBException(err?.message);
    }
  }

  // public async bindUserToMentor(
  //   userId: string,
  //   mentorId: string,
  // ): Promise<void> {
  //   try {
  //     const whitelistedUser: WhitelistedUser | null =
  //       await WhitelistedUser.findOne({
  //         where: { id: userId },
  //       });
  //     const mentorUser: Mentor | null = await Mentor.findOne({
  //       where: { id: mentorId },
  //     });

  //     if (!mentorUser || !whitelistedUser) {
  //       throw new Error('User or mentor not found');
  //     }

  //     const found: WhitelistedUserMentor | null =
  //       await WhitelistedUserMentor.findOne({
  //         where: {
  //           mentorUserId: mentorUser.id,
  //           whitelistedUserId: whitelistedUser.id,
  //         },
  //       });

  //     if (found) {
  //       await found.update({ mentorUserId: mentorUser.id });
  //     } else {
  //       await WhitelistedUserMentor.create({
  //         mentorUserId: mentorUser.id,
  //         whitelistedUserId: whitelistedUser.id,
  //       });
  //     }
  //   } catch (err: any) {
  //     console.log('err  ----> ', err);
  //   }
  // }

  // public async getMentors(): Promise<UserDTO[]> {
  //   try {
  //     const mentorUsers: Mentor[] = await Mentor.findAll({});
  //     return mentorUsers.map((mentor) => UserDTOMapper(mentor));
  //   } catch (err: any) {
  //     throw new DBException(err?.message);
  //   }
  // }
}
