import { Injectable, Inject } from '@nestjs/common';
import { InteractionResponseType } from 'discord-interactions';
import { UserDto } from '../dto/user.dto';
import { User } from '../entities/User.entity';
import axios from 'axios';
import { Response } from 'express';
import { config } from 'dotenv';
config();

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

  async responseForMeeting(id: string, token: string) {
    try {
      // await this.usersRepository.create({
      //   discordId: user.id,
      //   name: user.username,
      // });

      // await axios({
      //   method: 'POST',
      //   url: `https://discord.com/api/v10/interactions/${id}/${token}/callback`,
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   data: {
      //     type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      //     data: {
      //       content: 'Redirecting to the calendar 22222',
      //     },
      //   },
      // });

      // return;

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
