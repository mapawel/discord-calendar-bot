import { BadRequestException, Injectable } from '@nestjs/common';
import { DiscordUserDTO } from '../../dto/Discord-user.dto';
import { AppUserDTO } from '../../../users/dto/App-user.dto';
import { UsersService } from '../../../users/providers/users.service';
import { commandsSelectComponents } from '../../../app-SETUP/lists/commands-select-components.list';
import { commandsModalComponents } from 'src/app-SETUP/lists/commands-modal-components.list';
import { StateService } from '../../../app-state/State.service';
import { ResponseComponentsProvider } from '../response-components.provider';
import { settings } from 'src/app-SETUP/settings';

@Injectable()
export class InteractionsBotManagingService {
  constructor(
    private readonly usersService: UsersService,
    private readonly stateService: StateService,
    private readonly responseComponentsProvider: ResponseComponentsProvider,
  ) {}

  async addingUserToWhitelist(
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

  async addingUserToWhitelistCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
    components: any[], //TODO to make a type
  ) {
    const userId = components[0].components[0].value;
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

  async removingUserFromWhitelist(
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

  async removingUserFromWhitelistCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
    components: any[], //TODO to make a type
  ) {
    const idToRemove = components[0].components[0].value;
    if (!parseInt(idToRemove)) throw new BadRequestException();

    await this.usersService.updateUserWhitelistStatus(idToRemove, false);

    await this.responseComponentsProvider.generateInteractionResponse({
      id,
      token,
      type: 7,
      content: `User id ${idToRemove} removed!`,
    });
  }

  async settingUserConnections(
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

  async connectingUserToMentorCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
    components: any[], //TODO to make a type
  ) {
    const userToConnectId = components[0].components[0].value;
    if (!parseInt(userToConnectId)) throw new BadRequestException();

    const userToConnect: DiscordUserDTO =
      await this.usersService.getUserFromDiscord(userToConnectId);
    await this.usersService.createUserIfNotExisting(userToConnect);

    await this.stateService.saveDataAsSession(
      discordUser.id,
      userToConnectId,
      'continuationUserBinding',
    );

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
      content: `User ${userToConnect.username} will be able to meet with:`,
      components: commandsSelectComponents.managingBotSelectMentorToConnect.map(
        (component) => ({
          ...component,
          options: this.mapUsersToSelectOptions(personsToMeet),
        }),
      ),
    });
  }

  async connectingUserToMentorCallback2(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    const [mentorToConnect] = values;

    const userToBindId: string | undefined =
      await this.stateService.loadDataForUserId(
        discordUser.id,
        'continuationUserBinding',
      );

    if (!userToBindId)
      return this.responseComponentsProvider.generateInteractionResponse({
        id,
        token,
        type: 7,
        content: `try again... starting from slash command`,
      });

    const { error } = await this.usersService.bindUsers(
      userToBindId,
      mentorToConnect,
      3,
    );
    if (error)
      return this.responseComponentsProvider.generateInteractionResponse({
        id,
        token,
        type: 7,
        content: `error: ${error}`,
      });

    await this.stateService.removeDataForUserId(
      discordUser.id,
      'continuationUserBinding',
    );
    return await this.responseComponentsProvider.generateInteractionResponse({
      id,
      token,
      type: 7,
      content: `User connected to selected metor!`,
    });
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
}
