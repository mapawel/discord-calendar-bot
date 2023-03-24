import { MentorUserDto } from './mentor-user.dto';
import { MentorUser } from '../entities/mentor-user.entity';

export const mentorUserDtoMapper = (mentorUser: MentorUser): MentorUserDto => ({
  discordId: mentorUser.discordId,
  username: mentorUser.username,
});
