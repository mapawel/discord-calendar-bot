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

@Injectable()
export class InteractionsBotManagingService {
  constructor(
    private readonly usersService: UsersService,
    private readonly responseComponentsProvider: ResponseComponentsProvider,
  ) {}

  public async addingUserToWhitelist(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    return this.responseComponentsProvider.generateOneInputModal({
      id,
      token,
      component: commandsModalComponents.managingBotModalAdding,
    });
  }

  public async addingUserToWhitelistCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
    components: InteractionComponentDTO[],
  ) {
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
      type: 7,
      content: `User ${userToAdd.username} added!`,
    });
  }

  public async removingUserFromWhitelist(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    const usersToShow: AppUserDTO[] =
      await this.usersService.getAllWhitelistedUsers();

    if (!usersToShow.length)
      return this.responseComponentsProvider.generateInteractionResponse({
        id,
        token,
        type: 4,
        content: 'Nothing to remove...',
      });

    return this.responseComponentsProvider.generateOneInputModal({
      id,
      token,
      component: commandsModalComponents.managingBotModalRemoving,
    });
  }

  public async removingUserFromWhitelistCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
    components: InteractionComponentDTO[],
  ) {
    const idToRemove: string | undefined =
      components?.[0]?.components?.[0]?.value ||
      'not parsed to int throws error';
    if (!parseInt(idToRemove)) throw new BadRequestException();

    await this.usersService.updateUserWhitelistStatus(idToRemove, false);

    await this.responseComponentsProvider.generateInteractionResponse({
      id,
      token,
      type: 7,
      content: `User id ${idToRemove} removed!`,
    });
  }

  public async settingUserConnections(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    return this.responseComponentsProvider.generateOneInputModal({
      id,
      token,
      component: commandsModalComponents.managingBotModalUserToConnect,
    });
  }

  public async settingUserConUserSelected(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
    components: InteractionComponentDTO[],
  ) {
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
      return this.responseComponentsProvider.generateInteractionResponse({
        id,
        token,
        type: 7,
        content: `No users to meet with...`,
      });

    return await this.responseComponentsProvider.generateInteractionResponse({
      id,
      token,
      type: 7,
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
      components: commandsSelectComponents.managingBotSelectMentorToConnect.map(
        (component) => ({
          ...component,
          options: this.mapUsersToSelectOptions(personsToMeet),
        }),
      ),
    });
  }

  public async settingUserConHostSelected(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
    components: InteractionComponentDTO[],
    message: InteractionMessageDTO,
  ) {
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
      return this.responseComponentsProvider.generateInteractionResponse({
        id,
        token,
        type: 7,
        content: `error: ${error}`,
      });

    return await this.responseComponentsProvider.generateInteractionResponse({
      id,
      token,
      type: 7,
      content: `User connected to selected metor!`,
    });
  }

  public async displayWhitelist(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    const usersToShow: AppUserDTO[] =
      await this.usersService.getAllWhitelistedUsers();

    const splitedDataForEmbeds: string[][] =
      this.splitUserdataForLimitedFields(usersToShow);
    const embedFields: InteractionEmbedFieldDTO[] =
      this.buildEmbedFieldsFromData(splitedDataForEmbeds);

    if (!usersToShow.length)
      return this.responseComponentsProvider.generateInteractionResponse({
        id,
        token,
        type: 4,
        content: 'The whitelist is empty...',
      });

    return this.responseComponentsProvider.generateInteractionResponse({
      id,
      token,
      type: 7,
      embed: {
        title: embedTitles.whitelist.title,
        fields: embedFields,
      },
    });
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
