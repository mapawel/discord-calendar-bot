import { Injectable } from '@nestjs/common';
import { InteractionResponseType } from 'discord-interactions';
import { UserDTO } from '../../user-management/dto/User.dto';
import { config } from 'dotenv';
import { AppRoutes } from 'src/app-routes/app-routes.enum';
import { commandsComponents } from 'src/app-SETUP/commands-components.list';
import { UsersService } from 'src/users/providers/users.service';
import { commands } from 'src/app-SETUP/commands.list';
import { Commands } from 'src/app-SETUP/commands.enum';
import { ResponseComponentsProvider } from './response-components.provider';

config();

@Injectable()
export class IntegrationSlashCommandsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly responseComponentsProvider: ResponseComponentsProvider,
  ) {}

  responseWithPong() {
    return {
      type: InteractionResponseType.PONG,
    };
  }

  async responseForMeeting() {
    return this.responseComponentsProvider.generateIntegrationResponse({
      content: this.responseComponentsProvider.findContent(
        commands,
        Commands.GET_MEETING,
      ),
    });
  }

  async authenticate(user: UserDTO) {
    await this.usersService.createUserIfNotExisting(user);

    return this.responseComponentsProvider.generateIntegrationResponse({
      components: [
        {
          type: 2,
          label: this.responseComponentsProvider.findContent(
            commands,
            Commands.AUTHENTICATE,
          ),
          style: 5,
          url: `${process.env.APP_BASE_URL}${AppRoutes.LOGIN_CONTROLLER}${AppRoutes.LOGIN_METHOD}?id=${user.id}`,
        },
      ],
    });
  }

  async managingBot() {
    return this.responseComponentsProvider.generateIntegrationResponse({
      content: this.responseComponentsProvider.findContent(
        commands,
        Commands.BOT_MANAGE,
      ),
      components: commandsComponents.managingBot,
    });
  }

  public async default(user: UserDTO, values: string[]) {
    return this.responseComponentsProvider.generateIntegrationResponse({
      content: 'No action implemented for this command yet.',
    });
  }
}
