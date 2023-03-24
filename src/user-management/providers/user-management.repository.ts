import { Injectable } from '@nestjs/common';
import { WhitelistedUser } from '../entities/whitelisted-user.entity';
import { WhitelistedUserDto } from '../dto/whitelisted-user.dto';
import { whitelistedUserDtoMapper } from '../dto/whitelisted-user-dto.mapper';
import { MentorUser } from '../entities/mentor-user.entity';
import { UsersFromDiscordDTO } from '../dto/users-from-discord.dto';
import { MentorUserDto } from '../dto/mentor-user.dto';
import { mentorUserDtoMapper } from '../dto/mentor-user-dto.mapper';
import { WhitelistedUserMentor } from '../entities/whitelisted-user-mentor.entity';

@Injectable()
export class UserManagementRepository {
  async checkOnWhitelist(
    discordId: string,
  ): Promise<WhitelistedUserDto | undefined> {
    const found: WhitelistedUser | null = await WhitelistedUser.findOne({
      where: { discordId },
    });
    return found ? whitelistedUserDtoMapper(found) : undefined;
  }

  async addToWhitelist(discordId: string, username: string): Promise<true> {
    await WhitelistedUser.create({ discordId, username });
    return true;
  }

  async getFromWhitelist(): Promise<WhitelistedUserDto[]> {
    const foundUsers: WhitelistedUser[] = await WhitelistedUser.findAll();
    return foundUsers.map((user) => whitelistedUserDtoMapper(user));
  }

  async removeFromWhitelist(discordId: string): Promise<boolean> {
    const found: WhitelistedUser | null = await WhitelistedUser.findOne({
      where: { discordId },
    });
    if (!found) return false;

    await found.destroy();
    return true;
  }

  public async createOrUpdateMentors(
    users: UsersFromDiscordDTO[],
  ): Promise<void> {
    const discordIds: string[] = users.map((user) => user.id);
    const foundMentorsIds: MentorUser[] = await MentorUser.findAll({});
    const newMentors: UsersFromDiscordDTO[] = users.filter(
      ({ id }: { id: string }) =>
        !foundMentorsIds.some((mentor) => mentor.discordId === id),
    );
    const mentorsToDeleteIds: MentorUser[] = foundMentorsIds.filter(
      (mentor) => !discordIds.includes(mentor.discordId),
    );

    await MentorUser.bulkCreate(
      newMentors.map((mentor) => ({
        discordId: mentor.id,
        username: mentor.username,
      })),
    );
    await MentorUser.destroy({
      where: {
        discordId: mentorsToDeleteIds.map((mentor) => mentor.discordId),
      },
    });

    return;
  }

  public async bindUserToMentor(
    userDiscordId: string,
    mentorDiscordId: string,
  ): Promise<void> {
    try {
      const whitelistedUser: WhitelistedUser | null =
        await WhitelistedUser.findOne({
          where: { discordId: userDiscordId },
        });
      const mentorUser: MentorUser | null = await MentorUser.findOne({
        where: { discordId: mentorDiscordId },
      });

      if (!mentorUser || !whitelistedUser) {
        throw new Error('User or mentor not found');
      }

      const found: WhitelistedUserMentor | null =
        await WhitelistedUserMentor.findOne({
          where: {
            mentorUserId: mentorUser.discordId,
            whitelistedUserId: whitelistedUser.discordId,
          },
        });


      if (found) {
        await found.update({ mentorUserId: mentorUser.discordId });
      } else {
        await WhitelistedUserMentor.create({
          mentorUserId: mentorUser.discordId,
          whitelistedUserId: whitelistedUser.discordId,
        });
      }
    } catch (err: any) {
      console.log('err  ----> ', err);
    }
  }

  public async getMentors(): Promise<MentorUserDto[]> {
    const mentorUsers: MentorUser[] = await MentorUser.findAll({});
    return mentorUsers.map((mentor) => mentorUserDtoMapper(mentor));
  }
}
