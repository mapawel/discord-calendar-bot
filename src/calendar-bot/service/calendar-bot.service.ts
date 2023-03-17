import { Injectable, Inject } from '@nestjs/common';
import { InteractionResponseType } from 'discord-interactions';
import { UserDto } from '../dto/user.dto';
import { User } from '../entities/User.entity';
import axios from 'axios';
import { Response } from 'express';
import { config } from 'dotenv';
import { AppRoutes } from 'src/routes/app-routes.enum';
import { AxiosProvider } from 'src/axios/axios.provider';

config();

@Injectable()
export class CalendarBotService {
  constructor(
    @Inject('USERS_REPOSITORY')
    private usersRepository: typeof User,
    private readonly axiosProvider: AxiosProvider,
  ) {}

  responseWithPong() {
    return {
      type: InteractionResponseType.PONG,
    };
  }

  async responseForMeeting(id: string) {
    try {
      const { data: data1 } = await this.axiosProvider.instance({
        method: 'GET',
        url: `/guilds/${process.env.GUILD_ID}/members/${id}`,
      });
      const { data: data2 } = await this.axiosProvider.instance({
        method: 'GET',
        url: `/guilds/${process.env.GUILD_ID}/roles`,
      });

      console.log('data1 ----> ', data1);
      console.log('data2 ----> ', data2);

      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'Redirecting to the calendar...',
        },
      };
    } catch (err: any) {
      console.log('err ----> ', err);
      throw new Error(err);
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
