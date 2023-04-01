import { config } from 'dotenv';
import { Injectable } from '@nestjs/common';
import { DiscordUserDTO } from '../../dto/Discord-user.dto';
import { AppUserDTO } from '../../../users/dto/App-user.dto';
import { UsersService } from '../../../users/providers/users.service';
import { commandsSelectComponents } from '../../../app-SETUP/lists/commands-select-components.list';
import { StateService } from '../../../app-state/State.service';
import { ResponseComponentsProvider } from '../response-components.provider';

config();

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
    const usersToShow: DiscordUserDTO[] =
      await this.usersService.getUsersToShow();

    if (!usersToShow.length)
      return this.responseComponentsProvider.generateIntegrationResponse({
        id,
        token,
        type: 4,
        content: 'No more users to add to the whitelist.',
      });

    return this.responseComponentsProvider.generateIntegrationResponse({
      id,
      token,
      type: 4,
      content: 'Choose a user to add to the whitelist:',
      components: commandsSelectComponents.managingBotSelectAdding.map(
        (component) => ({
          ...component,
          options: usersToShow.map((user) => ({
            label: user.username,
            value: user.id,
            description: user.id,
          })),
        }),
      ),
    });
  }

  async addingUserToWhitelistCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    const [userId] = values;

    const userToAdd: DiscordUserDTO =
      await this.usersService.getUserFromDiscord(userId);

    await this.usersService.updateUserWhitelistStatus(userToAdd.id, true);

    await this.responseComponentsProvider.generateIntegrationResponse({
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
      return this.responseComponentsProvider.generateIntegrationResponse({
        id,
        token,
        type: 4,
        content: 'Nothing to remove...',
      });

    return this.responseComponentsProvider.generateIntegrationResponse({
      id,
      token,
      type: 4,
      content: 'Choose user to remove from whitelist:',
      components: commandsSelectComponents.managingBotSelectRemoving.map(
        (component) => ({
          ...component,
          options: usersToShow.map((user) => ({
            label: user.username,
            value: user.dId,
            description: user.dId,
          })),
        }),
      ),
    });
  }

  async removingUserFromWhitelistCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    const [idToRemove] = values;
    await this.usersService.updateUserWhitelistStatus(idToRemove, false);

    await this.responseComponentsProvider.generateIntegrationResponse({
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
    const usersToShow: AppUserDTO[] = await this.usersService.getAllUsers();

    return this.responseComponentsProvider.generateIntegrationResponse({
      id,
      token,
      type: 4,
      content: 'Choose a user to connect with persons to meet:',
      components: commandsSelectComponents.managingBotSelectUserToConnect.map(
        (component) => ({
          ...component,
          options: usersToShow.map((user) => ({
            label: user.dId,
            value: user.dId,
            description: user.username,
          })),
        }),
      ),
    });
  }

  async connectingUserToMentorCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    const [userToConnect] = values;

    const personsToMeet: AppUserDTO[] = await this.usersService.getAllUsers();
    // TODO take users from discord with persont-to-meet role

    await this.stateService.saveDataAsSession(
      discordUser.id,
      userToConnect,
      'continuationUserBinding',
    );
    return await this.responseComponentsProvider.generateIntegrationResponse({
      id,
      token,
      type: 7,
      content: `User id ${userToConnect} will be able to meet with:`,
      components: commandsSelectComponents.managingBotSelectMentorToConnect.map(
        (component) => ({
          ...component,
          options: personsToMeet.map((user) => ({
            label: user.username,
            value: user.dId,
            description: user.dId,
          })),
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
      return this.responseComponentsProvider.generateIntegrationResponse({
        id,
        token,
        type: 7,
        content: `try again... starting from slash command`,
      });

    await this.usersService.bindUsers(userToBindId, mentorToConnect);
    await this.stateService.removeDataForUserId(
      discordUser.id,
      'continuationUserBinding',
    );
    return await this.responseComponentsProvider.generateIntegrationResponse({
      id,
      token,
      type: 7,
      content: `User connected to selected metor!`,
    });
  }
}
