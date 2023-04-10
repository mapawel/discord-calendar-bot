import { Injectable, NotFoundException } from '@nestjs/common';
import { InteractionResponseType } from 'discord-interactions';
import { AppUserDTO } from '../../../users/dto/App-user.dto';
import { AppRoutes } from '../../../routes/routes.enum';
import { commandsComponents } from '../../../app-SETUP/lists/commands-components.list';
import { UsersService } from '../../../users/providers/users.service';
import { commands } from '../../../app-SETUP/lists/commands.list';
import { Commands } from '../../../app-SETUP/enums/commands.enum';
import { AppCommand } from '../../../app-SETUP/lists/commands.list';
import { ResponseComponentsProvider } from '../response-components.provider';
import { CommandsComponents } from '../../../app-SETUP/enums/commands-components.enum';
import { authButtonComponent } from '../../../app-SETUP/lists/auth-button-component.list';
import { DiscordInteractionException } from '../../../discord-interactions/exception/Discord-interaction.exception';
import { InteractionBodyFieldsType } from 'src/discord-interactions/types/Body-fields.type';

@Injectable()
export class IntegrationSlashCommandsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly responseComponentsProvider: ResponseComponentsProvider,
  ) {}

  async responseWithPong() {
    try {
      return {
        type: InteractionResponseType.PONG,
      };
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, {
        causeErr: err,
      });
    }
  }

  async getMeetingInit(interactionBodyFieldsType: InteractionBodyFieldsType) {
    try {
      const { discordUser, id, token }: InteractionBodyFieldsType =
        interactionBodyFieldsType;
      const foundUser: AppUserDTO | undefined =
        await this.usersService.getUserByDId(discordUser.id);
      if (!foundUser) throw new NotFoundException('User not found!');

      if (foundUser.mentors.length) {
        await this.responseComponentsProvider.generateInteractionResponse({
          id,
          token,
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          content: 'Choose a person to meet with:',
          components: foundUser?.mentors.map((connectedUser: AppUserDTO) => ({
            ...commandsComponents.mentorToMeetWithButton[0],
            label: connectedUser.username,
            custom_id: `${CommandsComponents.MEETING_CALLBACK}${connectedUser.dId}`,
          })),
        });
      } else {
        await this.responseComponentsProvider.generateInteractionResponse({
          id,
          token,
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          content:
            'You have no contacts to meet with. Please contact an admin.',
        });
      }
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, {
        causeErr: err,
      });
    }
  }

  async authenticate(interactionBodyFieldsType: InteractionBodyFieldsType) {
    try {
      const { discordUser, id, token }: InteractionBodyFieldsType =
        interactionBodyFieldsType;

      await this.usersService.createUserIfNotExisting(discordUser);

      await this.responseComponentsProvider.generateInteractionResponse({
        id,
        token,
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        components: authButtonComponent.map((component) => ({
          ...component,
          url: `${process.env.APP_BASE_URL}${AppRoutes.LOGIN_CONTROLLER}${AppRoutes.LOGIN_METHOD}?id=${discordUser.id}`,
        })),
      });
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, {
        causeErr: err,
      });
    }
  }

  async manageBot(interactionBodyFieldsType: InteractionBodyFieldsType) {
    try {
      const { id, token }: InteractionBodyFieldsType =
        interactionBodyFieldsType;

      await this.responseComponentsProvider.generateInteractionResponse({
        id,
        token,
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        content: this.findContent(commands, Commands.BOT_MANAGE),
        components: commandsComponents.manageBot,
      });
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, {
        causeErr: err,
      });
    }
  }

  public async default(interactionBodyFieldsType: InteractionBodyFieldsType) {
    try {
      const { id, token }: InteractionBodyFieldsType =
        interactionBodyFieldsType;

      await this.responseComponentsProvider.generateInteractionResponse({
        id,
        token,
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        content: 'No action implemented for this command yet.',
      });
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, {
        causeErr: err,
      });
    }
  }

  private findContent(array: AppCommand[], objName: Commands): string {
    return array.find((obj) => obj.name === objName)?.content || '';
  }
}
