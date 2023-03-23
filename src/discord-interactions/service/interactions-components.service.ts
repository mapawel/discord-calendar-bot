import { Injectable } from '@nestjs/common';
import { UserDto } from '../../users/dto/user.dto';
import { config } from 'dotenv';
import { UserManagementService } from 'src/user-management/providers/user-management.service';
import { commandsSelectComponents } from 'src/app-SETUP/commands-select-components.list';
import { UsersFromDiscordDTO } from 'src/user-management/dto/users-from-discord.dto';
import { WhitelistedUserDto } from 'src/user-management/dto/whitelisted-user.dto';
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

  async addingUserToWhitelist(user: UserDto, values: string[], token: string) {
    const usersToShow: UsersFromDiscordDTO[] =
      await this.responseComponentsProvider.getUsersToShow();

    if (!usersToShow.length)
      return this.responseComponentsProvider.generateIntegrationResponse({
        content: 'No more users to add to the whitelist.',
      });

    await this.stateService.saveThisAsSession(user.id, token);
    return this.responseComponentsProvider.generateIntegrationResponse({
      content: 'Choose a user to add to the whitelist:',
      components: commandsSelectComponents.managingBotSelectAdding.map(
        (component) => ({
          ...component,
          options: usersToShow.map((user) => ({
            label: user.username,
            value: user.id,
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
    await this.userManagementService.addToWhitelistIdNotExisting(
      discordIdToAdd,
    );

    const lastMessageToken: string | undefined =
      await this.stateService.loadTokenForDiscordId(user.id);

    if (!lastMessageToken)
      return this.responseComponentsProvider.generateIntegrationResponse({
        content: `User ${discordIdToAdd} added!`,
      });

    await this.responseComponentsProvider.updateEarlierIntegrationResponse({
      lastMessageToken,
      content: `User ${discordIdToAdd} added!`,
    });

    await this.stateService.removeTokenForDiscordId(user.id);
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

    await this.stateService.saveThisAsSession(user.id, token);
    return this.responseComponentsProvider.generateIntegrationResponse({
      content: 'Choose user id to remove from whitelist:',
      components: commandsSelectComponents.managingBotSelectRemoving.map(
        (component) => ({
          ...component,
          options: usersToShow.map((user) => ({
            label: user.discordId,
            value: user.discordId,
          })),
        }),
      ),
    });
  }

  async removingUserFromWhitelistCallback(user: UserDto, values: string[]) {
    const [discordIdToRemove] = values;
    await this.userManagementService.removeExistingUsers(discordIdToRemove);

    const lastMessageToken: string | undefined =
      await this.stateService.loadTokenForDiscordId(user.id);

    if (!lastMessageToken)
      return this.responseComponentsProvider.generateIntegrationResponse({
        content: `User id ${discordIdToRemove} removed!`,
      });

    await this.responseComponentsProvider.updateEarlierIntegrationResponse({
      lastMessageToken,
      content: `User id ${discordIdToRemove} removed!`,
    });

    await this.stateService.removeTokenForDiscordId(user.id);
  }

  async settingUserConnections(user: UserDto) {
    return this.responseComponentsProvider.generateIntegrationResponse({
      content: 'bot received button click3',
    });
  }

  public async default(user: UserDto, values: string[]) {
    return this.responseComponentsProvider.generateIntegrationResponse({
      content: 'No action implemented for this command yet.',
    });
  }
}
