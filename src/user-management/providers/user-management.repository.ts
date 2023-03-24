import { Injectable } from '@nestjs/common';
import { WhitelistedUser } from '../entities/whitelisted-user.entity';
import { WhitelistedUserDto } from '../dto/whitelisted-user.dto';
import { whitelistedUserDtoMapper } from '../dto/whitelisted-user-dto.mapper';
import { MentorUser } from '../entities/mentor-user.entity';

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

  // TODO to change here with usernames!
  //TODO UserMentor MAPPER
  public async createOrUpdateMentors(discordIds: string[]): Promise<void> {
    const foundMentors: MentorUser[] = await MentorUser.findAll({});
    const newMentors: string[] = discordIds.filter(
      (id) => !foundMentors.some((mentor) => mentor.discordId === id),
    );
    const mentorsToDelete: MentorUser[] = foundMentors.filter(
      (mentor) => !discordIds.includes(mentor.discordId),
    );

    await MentorUser.bulkCreate(newMentors.map((discordId) => ({ discordId })));
    await MentorUser.destroy({
      where: {
        discordId: mentorsToDelete.map((mentor) => mentor.discordId),
      },
    });

    return;
  }

  public async getMentors(): Promise<MentorUser[]> {
    return await MentorUser.findAll({});
  }
}
