import { Injectable } from '@nestjs/common';
import { InteractionResponseType } from 'discord-interactions';
import { UserDto } from '../../users/dto/user.dto';
import { config } from 'dotenv';
import { AppRoutes } from 'src/app-routes/app-routes.enum';
import { commandsComponents } from 'src/discord-commands/app-commands-SETUP/commands-components.list';
import { UsersService } from 'src/users/providers/users.service';

config();

@Injectable()
export class IntegrationSlashCommandsService {
  constructor(private readonly usersService: UsersService) {}

  responseWithPong() {
    return {
      type: InteractionResponseType.PONG,
    };
  }

  async responseForMeeting() {
    return this.generateIntegrationResponse({
      content: 'Redirecting to the calendar...',
    });
  }

  async authenticate(user: UserDto) {
    const { id: discordId, username }: { id: string; username: string } = user;

    await this.usersService.createUserIfNotExisting(discordId, username);

    return this.generateIntegrationResponse({
      components: [
        {
          type: 2,
          label: 'Start authentication with Auth0',
          style: 5,
          url: `${process.env.APP_BASE_URL}${AppRoutes.LOGIN_CONTROLLER}${AppRoutes.LOGIN_METHOD}?id=${discordId}`,
        },
      ],
    });
  }

  async managingBot() {
    return this.generateIntegrationResponse({
      content: 'What do you want to do?',
      components: commandsComponents.managingBot,
    });
  }

  public async default(user: UserDto, values: string[]) {
    return this.generateIntegrationResponse({
      content: 'No action implemented for this command yet.',
    });
  }

  private async generateIntegrationResponse({
    content,
    components,
  }: {
    content?: string;
    components?: any[];
  }) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content,
        components: [
          {
            type: 1,
            components,
          },
        ],
      },
    };
  }
}
