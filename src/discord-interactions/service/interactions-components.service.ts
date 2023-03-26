import { Injectable } from '@nestjs/common';
import { UserDTO } from '../../user-management/dto/User.dto';
import { config } from 'dotenv';
import { UserManagementService } from 'src/user-management/providers/user-management.service';
import { commandsSelectComponents } from 'src/app-SETUP/commands-select-components.list';
import { StateService } from 'src/app-state/state.service';
import { ResponseComponentsProvider } from './response-components.provider';

config();

@Injectable()
export class IntegrationComponentsService {
  constructor(
    private readonly userManagementService: UserManagementService,
    private readonly stateService: StateService,
    private readonly responseComponentsProvider: ResponseComponentsProvider,
  ) {}

  // TODO - UserDTO split to AppUserDTO and DiscordUserDTO
  async responseForMeetingCallback(
    user: UserDTO,
    values: string[],
    token: string,
    custom_id: string,
  ) {
    const userID = user.id;
    const personToMeetId: string = custom_id.split(':')[1];

    return this.responseComponentsProvider.generateIntegrationResponse({
      content: `Meeting: ${userID} ${personToMeetId}`,
    });
  }

  async addingUserToWhitelist(user: UserDTO, values: string[], token: string) {
    const usersToShow: UserDTO[] =
      await this.responseComponentsProvider.getUsersToShow();

    if (!usersToShow.length)
      return this.responseComponentsProvider.generateIntegrationResponse({
        content: 'No more users to add to the whitelist.',
      });

    await this.stateService.saveDataAsSession(
      user.id,
      token,
      'continuationUserTokens',
    );
    return this.responseComponentsProvider.generateIntegrationResponse({
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
    user: UserDTO,
    values: string[],
    token: string,
  ) {
    const [userId] = values;

    const userToAdd: UserDTO =
      await this.userManagementService.getUserFromDiscord(userId);

    await this.userManagementService.addToWhitelistNotExistingUser(userToAdd);

    const lastMessageToken: string | undefined =
      await this.stateService.loadDataForUserId(
        user.id,
        'continuationUserTokens',
      );

    if (!lastMessageToken)
      return this.responseComponentsProvider.generateIntegrationResponse({
        content: `User ${userToAdd.username} added!`,
      });

    await this.responseComponentsProvider.updateEarlierIntegrationResponse({
      lastMessageToken,
      content: `User ${userToAdd.username} added!`,
    });

    await this.stateService.removeDataForUserId(
      user.id,
      'continuationUserTokens',
    );
  }

  async removingUserFromWhitelist(
    user: UserDTO,
    values: string[],
    token: string,
  ) {
    const usersToShow: UserDTO[] =
      await this.userManagementService.getExistingUsers();

    if (!usersToShow.length)
      return this.responseComponentsProvider.generateIntegrationResponse({
        content: 'Nothing to remove...',
      });

    await this.stateService.saveDataAsSession(
      user.id,
      token,
      'continuationUserTokens',
    );
    return this.responseComponentsProvider.generateIntegrationResponse({
      content: 'Choose user to remove from whitelist:',
      components: commandsSelectComponents.managingBotSelectRemoving.map(
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

  async removingUserFromWhitelistCallback(user: UserDTO, values: string[]) {
    const [idToRemove] = values;
    await this.userManagementService.removeExistingUsersFromWhitelist(
      idToRemove,
    );

    const lastMessageToken: string | undefined =
      await this.stateService.loadDataForUserId(
        user.id,
        'continuationUserTokens',
      );

    if (!lastMessageToken)
      return this.responseComponentsProvider.generateIntegrationResponse({
        content: `User id ${idToRemove} removed!`,
      });

    await this.responseComponentsProvider.updateEarlierIntegrationResponse({
      lastMessageToken,
      content: `User id ${idToRemove} removed!`,
    });

    await this.stateService.removeDataForUserId(
      user.id,
      'continuationUserTokens',
    );
  }

  async settingUserConnections(user: UserDTO, values: string[], token: string) {
    const usersToShow: UserDTO[] =
      await this.userManagementService.getExistingUsers();

    if (!usersToShow.length)
      return this.responseComponentsProvider.generateIntegrationResponse({
        content: 'No users to connect with persons to meet.',
      });

    await this.stateService.saveDataAsSession(
      user.id,
      token,
      'continuationUserTokens',
    );
    return this.responseComponentsProvider.generateIntegrationResponse({
      content: 'Choose a user to connect with persons to meet:',
      components: commandsSelectComponents.managingBotSelectUserToConnect.map(
        (component) => ({
          ...component,
          options: usersToShow.map((user) => ({
            label: user.id,
            value: user.id,
            description: user.username,
          })),
        }),
      ),
    });
  }

  async connectingUserToMentorCallback(
    user: UserDTO,
    values: string[],
    token: string,
  ) {
    const [userToConnect] = values;

    const lastMessageToken: string | undefined =
      await this.stateService.loadDataForUserId(
        user.id,
        'continuationUserTokens',
      );

    if (!lastMessageToken)
      return this.responseComponentsProvider.generateIntegrationResponse({
        content: `try again... starting from slash command`,
      });

    const personsToMeet: UserDTO[] =
      await this.userManagementService.getMentors();

    await this.responseComponentsProvider.updateEarlierIntegrationResponse({
      lastMessageToken,
      content: `Selected user id ${userToConnect}`,
    });

    await this.stateService.saveDataAsSession(
      user.id,
      userToConnect,
      'continuationUserBinding',
    );
    await this.stateService.saveDataAsSession(
      user.id,
      token,
      'continuationUserTokens',
    );
    return await this.responseComponentsProvider.generateIntegrationResponse({
      content: `User id ${userToConnect} will be able to meet with:`,
      components: commandsSelectComponents.managingBotSelectMentorToConnect.map(
        (component) => ({
          ...component,
          options: personsToMeet.map((user) => ({
            label: user.username,
            value: user.id,
            description: user.id,
          })),
        }),
      ),
    });
  }

  async connectingUserToMentorCallback2(user: UserDTO, values: string[]) {
    const [mentorToConnect] = values;

    const userToBindId: string | undefined =
      await this.stateService.loadDataForUserId(
        user.id,
        'continuationUserBinding',
      );
    const lastMessageToken: string | undefined =
      await this.stateService.loadDataForUserId(
        user.id,
        'continuationUserTokens',
      );

    if (!lastMessageToken || !userToBindId)
      return this.responseComponentsProvider.generateIntegrationResponse({
        content: `try again... starting from slash command`,
      });

    //logic to bind
    await this.userManagementService.bindUserToMentor(
      userToBindId,
      mentorToConnect,
    );

    await this.stateService.removeDataForUserId(
      user.id,
      'continuationUserBinding',
    );
    await this.stateService.removeDataForUserId(
      user.id,
      'continuationUserTokens',
    );
    return await this.responseComponentsProvider.updateEarlierIntegrationResponse(
      {
        lastMessageToken,
        content: `User connected to selected metor!`,
      },
    );
  }

  public async default(user: UserDTO, values: string[]) {
    return this.responseComponentsProvider.generateIntegrationResponse({
      content: 'No action implemented for this command yet.',
    });
  }
}
