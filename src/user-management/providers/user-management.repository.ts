import { Injectable } from '@nestjs/common';
import { WhitelistedUser } from '../entities/Whitelisted-user.entity';
import { UserDTOMapper } from '../dto/User-dto.mapper';
import { Mentor } from '../entities/Mentor.entity';
import { UserDTO } from '../dto/User.dto';
import { WhitelistedUserMentor } from '../entities/Whitelisted-user-mentor.entity';

@Injectable()
export class UserManagementRepository {
  async checkOnWhitelist(id: string): Promise<UserDTO | undefined> {
    const found: WhitelistedUser | null = await WhitelistedUser.findOne({
      where: { id },
    });
    return found ? UserDTOMapper(found) : undefined;
  }

  async addToWhitelist(id: string, username: string): Promise<true> {
    await WhitelistedUser.create({ id, username });
    return true;
  }

  async getFromWhitelist(): Promise<UserDTO[]> {
    const foundUsers: WhitelistedUser[] = await WhitelistedUser.findAll();
    return foundUsers.map((user) => UserDTOMapper(user));
  }

  async removeFromWhitelist(id: string): Promise<boolean> {
    const found: WhitelistedUser | null = await WhitelistedUser.findOne({
      where: { id },
    });
    if (!found) return false;

    await found.destroy();
    return true;
  }

  public async createOrUpdateMentors(users: UserDTO[]): Promise<void> {
    const ids: string[] = users.map((user) => user.id);
    const foundMentorsIds: Mentor[] = await Mentor.findAll({});
    const newMentors: UserDTO[] = users.filter(
      ({ id }: { id: string }) =>
        !foundMentorsIds.some((mentor) => mentor.id === id),
    );
    const mentorsToDeleteIds: Mentor[] = foundMentorsIds.filter(
      (mentor) => !ids.includes(mentor.id),
    );

    await Mentor.bulkCreate(
      newMentors.map((mentor) => ({
        id: mentor.id,
        username: mentor.username,
      })),
    );
    await Mentor.destroy({
      where: {
        id: mentorsToDeleteIds.map((mentor) => mentor.id),
      },
    });

    return;
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
    const mentorUsers: Mentor[] = await Mentor.findAll({});
    return mentorUsers.map((mentor) => UserDTOMapper(mentor));
  }
}
