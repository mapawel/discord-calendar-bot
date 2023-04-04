import { Injectable, NotFoundException } from '@nestjs/common';
import { AppUser } from '../entity/App-user.entity';
import { AppUserDTO } from '../dto/App-user.dto';
import { AppUserMapper } from '../dto/App-user.mapper';
import { DiscordUserDTO } from 'src/discord-interactions/dto/Discord-user.dto';
import { DBException } from 'src/db/exception/DB.exception';
import { AppUsersRelated } from '../entity/App-users-related.entity';

@Injectable()
export class UsersRepository {
  public async getFirstUserByParam(
    by: keyof AppUser,
    param: string,
  ): Promise<AppUserDTO | undefined> {
    try {
      const found: AppUser | null = await AppUser.findOne({
        where: { [by]: param },
        include: [
          {
            model: AppUser,
            as: 'mentors',
          },
        ],
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
          name: user.name,
          picture: user.picture,
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
      const updateResult: [number] = await AppUser.update(
        { whitelisted },
        { where: { dId } },
      );
      if (updateResult[0] === 0) throw new NotFoundException('User not found');
      return true;
    } catch (err: any) {
      if (err instanceof NotFoundException) throw err;
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

  public async bindUsers(
    sourceUserDId: string,
    targetUserDId: string,
    maxMentors?: number,
  ): Promise<{ error: string }> {
    try {
      const sourceUser: AppUserDTO | undefined = await this.getFirstUserByParam(
        'dId',
        sourceUserDId,
      );
      const targetUser: AppUserDTO | undefined = await this.getFirstUserByParam(
        'dId',
        targetUserDId,
      );

      if (!sourceUser || !targetUser) {
        throw new Error(
          'Al least one of passed users to connect for meetings not found',
        );
      }

      if (maxMentors && sourceUser.mentors.length >= maxMentors)
        return { error: 'Max mentors reached' };

      const found: AppUsersRelated | null = await AppUsersRelated.findOne({
        where: {
          sourceUserId: sourceUser.dId,
          targetUserId: targetUser.dId,
        },
      });

      if (found) {
        await found.update({ targetUserId: targetUser.dId });
      } else {
        await AppUsersRelated.create({
          sourceUserId: sourceUser.dId,
          targetUserId: targetUser.dId,
        });
      }
      return { error: '' };
    } catch (err: any) {
      throw new DBException(err?.message);
    }
  }
  sourceUserId: string;
}
