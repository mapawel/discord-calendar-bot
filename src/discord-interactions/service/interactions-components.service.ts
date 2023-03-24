import { Injectable } from '@nestjs/common';
import { UserDto } from '../../users/dto/user.dto';
import { config } from 'dotenv';
import { UserManagementService } from 'src/user-management/providers/user-management.service';
import { commandsSelectComponents } from 'src/app-SETUP/commands-select-components.list';
import { UsersFromDiscordDTO } from 'src/user-management/dto/users-from-discord.dto';
import { WhitelistedUserDto } from 'src/user-management/dto/whitelisted-user.dto';
import { StateService } from 'src/app-state/state.service';
import { ResponseComponentsProvider } from './response-components.provider';
import { MentorUser } from 'src/user-management/entities/mentor-user.entity';
import { MentorUserDto } from 'src/user-management/dto/mentor-user.dto';

config();

@Injectable()
export class IntegrationComponentsService {
  constructor(
    private readonly userManagementService: UserManagementService,
    private readonly stateService: StateService,
    private readonly responseComponentsProvider: ResponseComponentsProvider,
  ) {}

  async addingUserToWhitelist(user: UserDto, values: string[], token: string) {
    const usersToShow: UsersFromDiscordDTO[] =
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
    user: UserDto,
    values: string[],
    token: string,
  ) {
    const [discordIdToAdd] = values;

    const { username }: { username: string } =
      await this.userManagementService.getUserFromDiscord(discordIdToAdd);

    await this.userManagementService.addToWhitelistIdNotExisting(
      discordIdToAdd,
      username,
    );

    const lastMessageToken: string | undefined =
      await this.stateService.loadDataForDiscordId(
        user.id,
        'continuationUserTokens',
      );

    if (!lastMessageToken)
      return this.responseComponentsProvider.generateIntegrationResponse({
        content: `User ${discordIdToAdd} added!`,
      });

    await this.responseComponentsProvider.updateEarlierIntegrationResponse({
      lastMessageToken,
      content: `User ${discordIdToAdd} added!`,
    });

    await this.stateService.removeDataForDiscordId(
      user.id,
      'continuationUserTokens',
    );
  }

  async removingUserFromWhitelist(
    user: UserDto,
    values: string[],
    token: string,
  ) {
    const usersToShow: WhitelistedUserDto[] =
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
            value: user.discordId,
            description: user.discordId,
          })),
        }),
      ),
    });
  }

  async removingUserFromWhitelistCallback(user: UserDto, values: string[]) {
    const [discordIdToRemove] = values;
    await this.userManagementService.removeExistingUsers(discordIdToRemove);

    const lastMessageToken: string | undefined =
      await this.stateService.loadDataForDiscordId(
        user.id,
        'continuationUserTokens',
      );

    if (!lastMessageToken)
      return this.responseComponentsProvider.generateIntegrationResponse({
        content: `User id ${discordIdToRemove} removed!`,
      });

    await this.responseComponentsProvider.updateEarlierIntegrationResponse({
      lastMessageToken,
      content: `User id ${discordIdToRemove} removed!`,
    });

    await this.stateService.removeDataForDiscordId(
      user.id,
      'continuationUserTokens',
    );
  }

  async settingUserConnections(user: UserDto, values: string[], token: string) {
    const usersToShow: WhitelistedUserDto[] =
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
            label: user.discordId,
            value: user.discordId,
            description: user.username,
          })),
        }),
      ),
    });
  }

  async connectingUserToMentorCallback(
    user: UserDto,
    values: string[],
    token: string,
  ) {
    const [userToConnect] = values;

    const lastMessageToken: string | undefined =
      await this.stateService.loadDataForDiscordId(
        user.id,
        'continuationUserTokens',
      );

    if (!lastMessageToken)
      return this.responseComponentsProvider.generateIntegrationResponse({
        content: `try again... starting from slash command`,
      });

    const personsToMeet: MentorUserDto[] =
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
            value: user.discordId,
            description: user.discordId,
          })),
        }),
      ),
    });
  }

  async connectingUserToMentorCallback2(user: UserDto, values: string[]) {
    const [mentorToConnect] = values;

    const userToBindId: string | undefined =
      await this.stateService.loadDataForDiscordId(
        user.id,
        'continuationUserBinding',
      );
    const lastMessageToken: string | undefined =
      await this.stateService.loadDataForDiscordId(
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

    await this.stateService.removeDataForDiscordId(
      user.id,
      'continuationUserBinding',
    );
    await this.stateService.removeDataForDiscordId(
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

  public async default(user: UserDto, values: string[]) {
    return this.responseComponentsProvider.generateIntegrationResponse({
      content: 'No action implemented for this command yet.',
    });
  }
}
