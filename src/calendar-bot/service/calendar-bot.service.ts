import { Injectable, Inject } from '@nestjs/common';
import { InteractionResponseType } from 'discord-interactions';
import { UserDto } from '../dto/user.dto';
import { User } from '../entities/User.entity';

@Injectable()
export class CalendarBotService {
  constructor(
    @Inject('USERS_REPOSITORY')
    private usersRepository: typeof User,
  ) {}

  responseWithPong() {
    return {
      type: InteractionResponseType.PONG,
    };
  }

  async responseForMeeting(user: UserDto) {
    try {
      await this.usersRepository.create({
        discordId: user.id,
        name: user.username,
      });

      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'Redirecting to the calendar...',
        },
      };
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
}
