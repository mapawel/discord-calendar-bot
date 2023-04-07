import { Injectable, NotFoundException } from '@nestjs/common';
import { InteractionResponseType } from 'discord-interactions';
import { DiscordUserDTO } from '../dto/Discord-user.dto';
import { AppUserDTO } from '../../users/dto/App-user.dto';
import { AppRoutes } from '../../routes/routes.enum';
import { commandsComponents } from '../../app-SETUP/lists/commands-components.list';
import { UsersService } from '../../users/providers/users.service';
import { commands } from '../../app-SETUP/lists/commands.list';
import { Commands } from '../../app-SETUP/enums/commands.enum';
import { AppCommand } from '../../app-SETUP/lists/commands.list';
import { ResponseComponentsProvider } from './response-components.provider';
import { CommandsComponents } from '../../app-SETUP/enums/commands-components.enum';

@Injectable()
export class IntegrationSlashCommandsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly responseComponentsProvider: ResponseComponentsProvider,
  ) {}

  async responseWithPong() {
    return {
      type: InteractionResponseType.PONG,
    };
  }

  async responseForMeetingInit(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    const foundUser: AppUserDTO | undefined =
      await this.usersService.getUserByDId(discordUser.id);
    if (!foundUser) throw new NotFoundException('User not found!');

    if (foundUser.mentors.length) {
      return this.responseComponentsProvider.generateInteractionResponse({
        id,
        token,
        type: 4,
        content: 'Choose a person to meet with:',
        components: foundUser?.mentors.map((connectedUser: AppUserDTO) => ({
          ...commandsComponents.mentorToMeetWithButton[0],
          label: connectedUser.username,
          custom_id: `${CommandsComponents.MEETING_CALLBACK}${connectedUser.dId}`,
        })),
      });
    } else {
      return this.responseComponentsProvider.generateInteractionResponse({
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

    return this.responseComponentsProvider.generateInteractionResponse({
      id,
      token,
      type: 4,
      components: commandsComponents.authenticateButton.map((component) => ({
        ...component,
        url: `${process.env.APP_BASE_URL}${AppRoutes.LOGIN_CONTROLLER}${AppRoutes.LOGIN_METHOD}?id=${discordUser.id}`,
      })),
    });
  }

  async managingBot(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    return this.responseComponentsProvider.generateInteractionResponse({
      id,
      token,
      type: 4,
      content: this.findContent(commands, Commands.BOT_MANAGE),
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
    return this.responseComponentsProvider.generateInteractionResponse({
      id,
      token,
      type: 4,
      content: 'No action implemented for this command yet.',
    });
  }

  private findContent(array: AppCommand[], objName: Commands): string {
    return array.find((obj) => obj.name === objName)?.content || '';
  }
}
