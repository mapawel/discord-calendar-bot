import { Injectable } from '@nestjs/common';
import { InteractionResponseType } from 'discord-interactions';
import { DiscordUserDTO } from '../dto/Discord-user.dto';
import { AppUserDTO } from 'src/users/dto/App-user.dto';
import { config } from 'dotenv';
import { AppRoutes } from 'src/app-routes/app-routes.enum';
import { commandsComponents } from 'src/app-SETUP/commands-components.list';
import { UsersService } from 'src/users/providers/users.service';
import { commands } from 'src/app-SETUP/commands.list';
import { Commands } from 'src/app-SETUP/commands.enum';
import { ResponseComponentsProvider } from './response-components.provider';
import { CommandsComponents } from 'src/app-SETUP/commands-components.enum';
import { ResponseComponentsHelperService } from './response-components-helper.service';

config();

@Injectable()
export class IntegrationSlashCommandsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly responseComponentsProvider: ResponseComponentsProvider,
    private readonly responseComponentsHelperService: ResponseComponentsHelperService,
  ) {}

  responseWithPong() {
    return {
      type: InteractionResponseType.PONG,
    };
  }

  async responseForMeeting(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    const foundUser: AppUserDTO | undefined =
      await this.usersService.getUserByDId(discordUser.id);

    //TODO only mentors can meet with mentees
    if (foundUser?.mentors.length) {
      return this.responseComponentsProvider.generateIntegrationResponse({
        id,
        token,
        type: 4,
        content: 'Choose a person to meet with:',
        components: foundUser?.mentors.map((connectedUser) => ({
          ...commandsComponents.mentorToMeetWithButton[0],
          label: connectedUser.username,
          custom_id: CommandsComponents.MEETING_CALLBACK + connectedUser.dId,
        })),
      });
    } else {
      return this.responseComponentsProvider.generateIntegrationResponse({
        id,
        token,
        type: 4,
        content: 'You have no contacts to meet with. Please contact an admin.',
      });
    }
  }

  async authenticate(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    await this.usersService.createUserIfNotExisting(discordUser);

    return this.responseComponentsProvider.generateIntegrationResponse({
      id,
      token,
      type: 4,
      components: [
        {
          type: 2,
          label: this.responseComponentsHelperService.findContent(
            commands,
            Commands.AUTHENTICATE,
          ),
          style: 5,
          url: `${process.env.APP_BASE_URL}${AppRoutes.LOGIN_CONTROLLER}${AppRoutes.LOGIN_METHOD}?id=${discordUser.id}`,
        },
      ],
    });
  }

  async managingBot(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    return this.responseComponentsProvider.generateIntegrationResponse({
      id,
      token,
      type: 4,
      content: this.responseComponentsHelperService.findContent(
        commands,
        Commands.BOT_MANAGE,
      ),
      components: commandsComponents.managingBot,
    });
  }

  public async default(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    return this.responseComponentsProvider.generateIntegrationResponse({
      id,
      token,
      type: 4,
      content: 'No action implemented for this command yet.',
    });
  }
}
