import { Injectable } from '@nestjs/common';
import { WhitelistedUser } from '../entities/Whitelisted-user.entity';
import { UserDTOMapper } from '../dto/User-dto.mapper';
import { Mentor } from '../entities/Mentor.entity';
import { UserDTO } from '../dto/User.dto';
import { WhitelistedUserMentor } from '../entities/Whitelisted-user-mentor.entity';
import { DBException } from 'src/db/exception/DB.exception';

@Injectable()
export class UserManagementRepository {
  public async findByIdOnWhitelist(id: string): Promise<UserDTO | undefined> {
    try {
      const foundUser: WhitelistedUser | null = await WhitelistedUser.findByPk(
        id,
      );
      return foundUser ? UserDTOMapper(foundUser) : undefined;
    } catch (err: any) {
      throw new DBException(err?.message);
    }
  }

  public async addUserToWhitelist(user: UserDTO): Promise<true> {
    try {
      await WhitelistedUser.create({ id: user.id, username: user.username });
      return true;
    } catch (err: any) {
      throw new DBException(err?.message);
    }
  }

  public async getUsersFromWhitelist(): Promise<UserDTO[]> {
    try {
      const foundUsers: WhitelistedUser[] = await WhitelistedUser.findAll();
      return foundUsers.map((user) => UserDTOMapper(user));
    } catch (err: any) {
      throw new DBException(err?.message);
    }
  }

  public async removeExistingUsersFromWhitelist(id: string): Promise<boolean> {
    try {
      const found: WhitelistedUser | null = await WhitelistedUser.findOne({
        where: { id },
      });
      if (!found) return false;

      await found.destroy();
      return true;
    } catch (err: any) {
      throw new DBException(err?.message);
    }
  }

  public async createOrUpdateAllMentors(users: UserDTO[]): Promise<void> {
    try {
      const ids: string[] = users.map(({ id }: { id: string }) => id);
      const foundMentorsIds: Mentor[] = await Mentor.findAll({});
      const newMentors: UserDTO[] = users.filter(
        ({ id }: { id: string }) =>
          !foundMentorsIds.some((mentor) => mentor.id === id),
      );
      const mentorsToDeleteIds: Mentor[] = foundMentorsIds.filter(
        (mentor) => !ids.includes(mentor.id),
      );

      await Mentor.bulkCreate(
        newMentors.map(
          ({ id, username }: { id: string; username: string }) => ({
            id,
            username,
          }),
        ),
      );
      await Mentor.destroy({
        where: {
          id: mentorsToDeleteIds.map(({ id }: { id: string }) => id),
        },
      });

      return;
    } catch (err: any) {
      throw new DBException(err?.message);
    }
  }

  public async bindUserToMentor(
    userId: string,
    mentorId: string,
  ): Promise<void> {
    try {
      const whitelistedUser: WhitelistedUser | null =
        await WhitelistedUser.findOne({
          where: { id: userId },
        });
      const mentorUser: Mentor | null = await Mentor.findOne({
        where: { id: mentorId },
      });

      if (!mentorUser || !whitelistedUser) {
        throw new Error('User or mentor not found');
      }

      const found: WhitelistedUserMentor | null =
        await WhitelistedUserMentor.findOne({
          where: {
            mentorUserId: mentorUser.id,
            whitelistedUserId: whitelistedUser.id,
          },
        });

      if (found) {
        await found.update({ mentorUserId: mentorUser.id });
      } else {
        await WhitelistedUserMentor.create({
          mentorUserId: mentorUser.id,
          whitelistedUserId: whitelistedUser.id,
        });
      }
    } catch (err: any) {
      console.log('err  ----> ', err);
    }
  }

  public async getMentors(): Promise<UserDTO[]> {
    try {
      const mentorUsers: Mentor[] = await Mentor.findAll({});
      return mentorUsers.map((mentor) => UserDTOMapper(mentor));
    } catch (err: any) {
      throw new DBException(err?.message);
    }
  }
}
