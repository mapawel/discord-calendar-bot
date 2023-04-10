import { BadRequestException, Injectable } from '@nestjs/common';
import { DiscordUserDTO } from '../../dto/Discord-user.dto';
import { AppUserDTO } from '../../../users/dto/App-user.dto';
import { UsersService } from '../../../users/providers/users.service';
import { commandsSelectComponents } from '../../../app-SETUP/lists/commands-select-components.list';
import { commandsModalComponents } from '../../../app-SETUP/lists/commands-modal-components.list';
import { ResponseComponentsProvider } from '../response-components.provider';
import { settings } from '../../../app-SETUP/settings';
import { InteractionMessageDTO } from '../../../discord-interactions/dto/Interaction-message.dto';
import { embedTitles } from '../../../app-SETUP/lists/embed-titles.list';
import { InteractionEmbedFieldDTO } from '../../../discord-interactions/dto/Interaction-embed-field.dto';
import { InteractionComponentDTO } from '../../../discord-interactions/dto/Interaction-component.dto';
import { DiscordInteractionException } from '../../../discord-interactions/exception/Discord-interaction.exception';
import { InteractionResponseType } from 'discord-interactions';

@Injectable()
export class InteractionsBotManagingService {
  constructor(
    private readonly usersService: UsersService,
    private readonly responseComponentsProvider: ResponseComponentsProvider,
  ) {}

  public async addUserToWhitelist(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    try {
      await this.responseComponentsProvider.generateOneInputModal({
        id,
        token,
        component: commandsModalComponents.manageBotModalAdding,
      });
    } catch (err: any) {
      throw new DiscordInteractionException(err?.message, { causeErr: err });
    }
  }

  public async addUserToWhitelistCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
    components: InteractionComponentDTO[],
  ) {
    try {
      const userId: string | undefined =
        components?.[0]?.components?.[0]?.value ||
        'not parsed to int and throws error';
      if (!parseInt(userId)) throw new BadRequestException();

      const userToAdd: DiscordUserDTO =
        await this.usersService.getUserFromDiscord(userId);

      await this.usersService.createUserIfNotExisting(userToAdd);
      await this.usersService.updateUserWhitelistStatus(userToAdd.id, true);

      await this.responseComponentsProvider.generateInteractionResponse({
        id,
        token,
        type: InteractionResponseType.UPDATE_MESSAGE,
        content: `User ${userToAdd.username} added!`,
      });
    } catch (err: any) {
      throw new DiscordInteractionException(err?.message, { causeErr: err });
    }
  }

  public async removeUserFromWhitelist(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    try {
      const usersToShow: AppUserDTO[] =
        await this.usersService.getAllWhitelistedUsers();

      if (!usersToShow.length)
        return await this.responseComponentsProvider.generateInteractionResponse(
          {
            id,
            token,
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            content: 'Nothing to remove...',
          },
        );

      await this.responseComponentsProvider.generateOneInputModal({
        id,
        token,
        component: commandsModalComponents.manageBotModalRemoving,
      });
    } catch (err: any) {
      throw new DiscordInteractionException(err?.message, { causeErr: err });
    }
  }

  public async removeUserFromWhitelistCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
    components: InteractionComponentDTO[],
  ) {
    try {
      const idToRemove: string | undefined =
        components?.[0]?.components?.[0]?.value ||
        'not parsed to int throws error';
      if (!parseInt(idToRemove)) throw new BadRequestException();

      await this.usersService.updateUserWhitelistStatus(idToRemove, false);

      await this.responseComponentsProvider.generateInteractionResponse({
        id,
        token,
        type: InteractionResponseType.UPDATE_MESSAGE,
        content: `User id ${idToRemove} removed!`,
      });
    } catch (err: any) {
      throw new DiscordInteractionException(err?.message, { causeErr: err });
    }
  }

  public async setUserConnections(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    try {
      await this.responseComponentsProvider.generateOneInputModal({
        id,
        token,
        component: commandsModalComponents.manageBotModalUserToConnect,
      });
    } catch (err: any) {
      throw new DiscordInteractionException(err?.message, { causeErr: err });
    }
  }

  public async setUserConUserSelected(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
    components: InteractionComponentDTO[],
  ) {
    try {
      const userToConnectId: string | undefined =
        components?.[0]?.components?.[0]?.value ||
        'not parsed to int throws error';
      if (!parseInt(userToConnectId)) throw new BadRequestException();

      const userToConnect: DiscordUserDTO =
        await this.usersService.getUserFromDiscord(userToConnectId);
      await this.usersService.createUserIfNotExisting(userToConnect);

      const personsToMeet: DiscordUserDTO[] =
        await this.usersService.getUsersFromDiscord(
          settings.rolesUsersCanMeetWith,
        );

      if (!personsToMeet.length)
        return await this.responseComponentsProvider.generateInteractionResponse(
          {
            id,
            token,
            type: InteractionResponseType.UPDATE_MESSAGE,
            content: `No users to meet with...`,
          },
        );

      await this.responseComponentsProvider.generateInteractionResponse({
        id,
        token,
        type: InteractionResponseType.UPDATE_MESSAGE,
        embed: {
          title: embedTitles.connectingUser.title,
          fields: [
            {
              name: userToConnect.username,
              value: userToConnect.id,
            },
          ],
        },
        content: `User ${userToConnect.username} will be able to meet with:`,
        components: commandsSelectComponents.manageBotSelectMentorToConnect.map(
          (component) => ({
            ...component,
            options: this.mapUsersToSelectOptions(personsToMeet),
          }),
        ),
      });
    } catch (err: any) {
      throw new DiscordInteractionException(err?.message, { causeErr: err });
    }
  }

  public async setUserConHostSelected(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
    components: InteractionComponentDTO[],
    message: InteractionMessageDTO,
  ) {
    try {
      const [mentorToConnectId] = values;
      const currentEmbedFields: InteractionEmbedFieldDTO[] =
        this.extractFieldsFromMessage(message);
      const userToBindId: string = currentEmbedFields[0].value;

      const mentorToConnect: DiscordUserDTO =
        await this.usersService.getUserFromDiscord(mentorToConnectId);

      await this.usersService.createUserIfNotExisting(mentorToConnect);

      const { error } = await this.usersService.bindUsers(
        userToBindId,
        mentorToConnectId,
        3,
      );
      if (error)
        return await this.responseComponentsProvider.generateInteractionResponse(
          {
            id,
            token,
            type: InteractionResponseType.UPDATE_MESSAGE,
            content: `error: ${error}`,
          },
        );

      await this.responseComponentsProvider.generateInteractionResponse({
        id,
        token,
        type: InteractionResponseType.UPDATE_MESSAGE,
        content: `User connected to selected metor!`,
      });
    } catch (err: any) {
      throw new DiscordInteractionException(err?.message, { causeErr: err });
    }
  }

  public async displayWhitelist(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    try {
      const usersToShow: AppUserDTO[] =
        await this.usersService.getAllWhitelistedUsers();

      const splitedDataForEmbeds: string[][] =
        this.splitUserdataForLimitedFields(usersToShow);
      const embedFields: InteractionEmbedFieldDTO[] =
        this.buildEmbedFieldsFromData(splitedDataForEmbeds);

      if (!usersToShow.length)
        return await this.responseComponentsProvider.generateInteractionResponse(
          {
            id,
            token,
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            content: 'The whitelist is empty...',
          },
        );

      await this.responseComponentsProvider.generateInteractionResponse({
        id,
        token,
        type: InteractionResponseType.UPDATE_MESSAGE,
        embed: {
          title: embedTitles.whitelist.title,
          fields: embedFields,
        },
      });
    } catch (err: any) {
      throw new DiscordInteractionException(err?.message, { causeErr: err });
    }
  }

  private splitUserdataForLimitedFields(users: AppUserDTO[]): string[][] {
    const charactersLimit = 1024;
    let currentCharactersCount = 0;
    const allEmbedValuesArr: string[][] = [];
    let freshEmbedValues: string[] = [];

    for (let i = 0; i < users.length; i++) {
      currentCharactersCount +=
        users[i].username.length + users[i].dId.length + 5;

      if (currentCharactersCount < charactersLimit) {
        freshEmbedValues.push(`${users[i].username}-${users[i].dId}`);
      } else {
        allEmbedValuesArr.push(freshEmbedValues);
        freshEmbedValues = [];
        currentCharactersCount = 0;
        freshEmbedValues.push(`${users[i].username}-${users[i].dId}`);
      }
    }
    allEmbedValuesArr.push(freshEmbedValues);
    return allEmbedValuesArr;
  }

  private buildEmbedFieldsFromData(
    data: string[][],
  ): InteractionEmbedFieldDTO[] {
    return data.map((stringUserDataArr: string[]) => ({
      name: '',
      value: stringUserDataArr
        .map((stringUser: string) => stringUser)
        .join('\n'),
    }));
  }

  private isAppUser(
    users: AppUserDTO[] | DiscordUserDTO[],
  ): users is AppUserDTO[] {
    return (users[0] as AppUserDTO)?.dId !== undefined;
  }

  private mapUsersToSelectOptions(users: DiscordUserDTO[] | AppUserDTO[]) {
    if (this.isAppUser(users)) {
      return users.map((user) => ({
        label: user.username,
        value: user.dId,
        description: user.dId,
      }));
    } else {
      return users.map((user) => ({
        label: user.username,
        value: user.id,
        description: user.id,
      }));
    }
  }

  private extractFieldsFromMessage(
    message: InteractionMessageDTO,
  ): InteractionEmbedFieldDTO[] {
    const { embeds }: { embeds: { fields: InteractionEmbedFieldDTO[] }[] } =
      message;
    return embeds[0].fields;
  }
}
