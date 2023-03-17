import { Injectable, Inject } from '@nestjs/common';
import { InteractionResponseType } from 'discord-interactions';
import { UserDto } from '../dto/user.dto';
import { User } from '../entities/User.entity';
import axios from 'axios';
import { Response } from 'express';
import { config } from 'dotenv';
import { AppRoutes } from 'src/routes/app-routes.enum';

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

  async authenticate(user: UserDto) {
    try {
      const { id, username }: { id: string; username: string } = user;

      await this.usersRepository.create({
        discordId: id,
        name: username,
      });
      // TODO - add a check if the user already exists in the database

      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `${process.env.APP_BASE_URL}${AppRoutes.LOGIN_CONTROLLER}${AppRoutes.LOGIN_METHOD}?id=${id}`,
        },
      };
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
}
