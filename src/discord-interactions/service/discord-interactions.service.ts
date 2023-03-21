import { Injectable } from '@nestjs/common';
import { InteractionResponseType } from 'discord-interactions';
import { UserDto } from '../../users/dto/user.dto';
import { config } from 'dotenv';
import { AppRoutes } from 'src/app-routes/app-routes.enum';
import { commandsComponents } from 'src/discord-commands/app-commands-SETUP/commands-components.list';
import { UsersService } from 'src/users/providers/users.service';
import { UserManagementService } from 'src/user-management/providers/user-management.service';
import { commandsSelectComponents } from 'src/discord-commands/app-commands-SETUP/commands-select-components.list';
import { UsersFromDiscordDTO } from 'src/user-management/dto/users-from-discord.dto';

config();

@Injectable()
export class DiscordInteractionService {
  constructor(
    private readonly usersService: UsersService,
    private readonly userManagementService: UserManagementService,
  ) {}

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

  async addingUserToWhitelist() {
    const allUsers: UsersFromDiscordDTO[] =
      await this.userManagementService.getUsersFromDiscord();
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Choose a user to add to the whitelist:',
        components: [
          {
            type: 1,
            components: commandsSelectComponents.managingBotSelect1.map(
              (component) => ({
                type: component.type,
                placeholder: component.placeholder,
                options: allUsers
                  .filter(({ id }) => id !== process.env.APP_ID)
                  .map((user) => ({
                    label: user.username,
                    value: user.id,
                  })),
                custom_id: component.custom_id,
              }),
            ),
          },
        ],
      },
    };
  }

  async removingUserFromWhitelist() {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'bot received button click2',
      },
    };
  }

  async settingUserConnections() {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'bot received button click3',
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
