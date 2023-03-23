import { Injectable } from '@nestjs/common';
import { InteractionResponseType } from 'discord-interactions';
import { config } from 'dotenv';
import { UserManagementService } from 'src/user-management/providers/user-management.service';
import { UsersFromDiscordDTO } from 'src/user-management/dto/users-from-discord.dto';
import { WhitelistedUserDto } from 'src/user-management/dto/whitelisted-user.dto';
import { AxiosProvider } from 'src/axios/provider/axios.provider';
import { AppCommand } from 'src/app-SETUP/commands.list';
import { Commands } from 'src/app-SETUP/commands.enum';

config();

@Injectable()
export class ResponseComponentsProvider {
  constructor(
    private readonly userManagementService: UserManagementService,
    private readonly axiosProvider: AxiosProvider,
  ) {}

  public generateIntegrationResponse({
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
        components: components
          ? [
              {
                type: 1,
                components,
              },
            ]
          : [],
      },
    };
  }

  public async updateEarlierIntegrationResponse({
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

  public async getUsersToShow(): Promise<UsersFromDiscordDTO[]> {
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

  public findContent(
    array: AppCommand[],
    objName: Commands,
  ): string | undefined {
    return array.find((obj) => obj.name === objName)?.content;
  }
}
