import { Injectable } from '@nestjs/common';
import { InteractionResponseType } from 'discord-interactions';
import { UserDto } from '../../users/dto/user.dto';
import { config } from 'dotenv';
import { AppRoutes } from 'src/app-routes/app-routes.enum';
import { UsersService } from 'src/users/providers/users.service';
import { commandsComponents } from 'src/discord-commands/app-commands-SETUP/commands-components.list';

config();

@Injectable()
export class DiscordInteractionService {
  constructor(private usersService: UsersService) {}

  responseWithPong() {
    return {
      type: InteractionResponseType.PONG,
    };
  }

  async responseForMeeting(user: UserDto) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Redirecting to the calendar...',
      },
    };
  }

  async authenticate(user: UserDto) {
    try {
      const { id: discordId, username }: { id: string; username: string } =
        user;

      await this.usersService.createUserIfNotExisting(discordId, username);

      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  label: 'Start authentication with Auth0',
                  style: 5,
                  url: `${process.env.APP_BASE_URL}${AppRoutes.LOGIN_CONTROLLER}${AppRoutes.LOGIN_METHOD}?id=${discordId}`,
                },
              ],
            },
          ],
        },
      };
    } catch (err: any) {
      throw new Error(err.message);
    }
  }

  async managingBot() {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'What do you want to do?',
        components: [
          {
            type: 1,
            components: commandsComponents.managingBot.map((component) => ({
              type: component.type,
              label: component.label,
              style: component.style,
              custom_id: component.custom_id,
            })),
          },
        ],
      },
    };
  }

  async managingBotResponse() {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'bot received button click',
      },
    };
  }

  public async default(user: UserDto) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'No action implemented for this command yet.',
      },
    };
  }
}
