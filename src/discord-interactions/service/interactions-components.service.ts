import { Injectable } from '@nestjs/common';
import { InteractionResponseType } from 'discord-interactions';
import { UserDto } from '../../users/dto/user.dto';
import { config } from 'dotenv';
import { UserManagementService } from 'src/user-management/providers/user-management.service';
import { commandsSelectComponents } from 'src/discord-commands/app-commands-SETUP/commands-select-components.list';
import { UsersFromDiscordDTO } from 'src/user-management/dto/users-from-discord.dto';
import { WhitelistedUserDto } from 'src/user-management/dto/whitelisted-user.dto';
import { AxiosProvider } from 'src/axios/provider/axios.provider';
import { StateService } from 'src/app-state/state.service';

config();

@Injectable()
export class IntegrationComponentsService {
  constructor(
    private readonly userManagementService: UserManagementService,
    private readonly axiosProvider: AxiosProvider,
    private readonly stateService: StateService,
  ) {}

  async addingUserToWhitelist(user: UserDto, values: string[], token: string) {
    const usersToShow: UsersFromDiscordDTO[] = await this.getUsersToShow();

    if (!usersToShow.length)
      return this.generateIntegrationResponse({
        content: 'No more users to add to the whitelist.',
      });

    await this.stateService.saveThisAsSession(user.id, token);
    return this.generateIntegrationResponse({
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
      return this.generateIntegrationResponse({
        content: `User ${discordIdToAdd} added!`,
      });

    await this.updateEarlierIntegrationResponse({
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
      return this.generateIntegrationResponse({
        content: 'Nothing to remove...',
      });

    await this.stateService.saveThisAsSession(user.id, token);
    return this.generateIntegrationResponse({
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
      return this.generateIntegrationResponse({
        content: `User id ${discordIdToRemove} removed!`,
      });

    await this.updateEarlierIntegrationResponse({
      lastMessageToken,
      content: `User id ${discordIdToRemove} removed!`,
    });

    await this.stateService.removeTokenForDiscordId(user.id);
  }

  async settingUserConnections(user: UserDto) {
    return this.generateIntegrationResponse({
      content: 'bot received button click3',
    });
  }

  public async default(user: UserDto, values: string[]) {
    return this.generateIntegrationResponse({
      content: 'No action implemented for this command yet.',
    });
  }

  private async generateIntegrationResponse({
    content,
    components,
  }: {
    content?: string;
    components?: any[];
  }) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content,
        components: [
          {
            type: 1,
            components,
          },
        ],
      },
    };
  }

  private async updateEarlierIntegrationResponse({
    lastMessageToken,
    content,
  }: {
    lastMessageToken: string;
    content: string;
  }) {
    try {
      await this.axiosProvider.instance({
        method: 'PATCH',
        url: `/webhooks/${process.env.APP_ID}/${lastMessageToken}/messages/@original`,
        data: {
          content,
          components: [],
        },
      });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  private async getUsersToShow(): Promise<UsersFromDiscordDTO[]> {
    const allUsers: UsersFromDiscordDTO[] =
      await this.userManagementService.getUsersFromDiscord();
    const existingUsers: WhitelistedUserDto[] =
      await this.userManagementService.getExistingUsers();
    const existingUsersIds: string[] = existingUsers.map(
      ({ discordId }) => discordId,
    );
    return allUsers.filter(
      ({ id }) => id !== process.env.APP_ID && !existingUsersIds.includes(id),
    );
  }
}
