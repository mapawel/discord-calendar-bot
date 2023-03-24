import { Injectable } from '@nestjs/common';
import { InteractionResponseType } from 'discord-interactions';
import { config } from 'dotenv';
import { UserManagementService } from 'src/user-management/providers/user-management.service';
import { UserDTO } from '../../user-management/dto/User.dto';
import { AxiosProvider } from 'src/axios/provider/axios.provider';
import { AppCommand } from 'src/app-SETUP/commands.list';
import { Commands } from 'src/app-SETUP/commands.enum';
import { DiscordInteractionException } from '../exception/DiscordInteraction.exception';

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
        components: components?.length
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
    components,
  }: {
    lastMessageToken: string;
    content: string;
    components?: any[];
  }) {
    try {
      await this.axiosProvider.instance({
        method: 'PATCH',
        url: `/webhooks/${process.env.APP_ID}/${lastMessageToken}/messages/@original`,
        data: {
          content,
          components: components?.length
            ? [
                {
                  type: 1,
                  components,
                },
              ]
            : [],
        },
      });
    } catch (err: any) {
      throw new DiscordInteractionException(err?.message);
    }
  }

  public async getUsersToShow(): Promise<UserDTO[]> {
    const allUsers: UserDTO[] =
      await this.userManagementService.getUsersFromDiscord();
    const existingUsers: UserDTO[] =
      await this.userManagementService.getExistingUsers();
    const existingUsersIds: string[] = existingUsers.map(
      ({ id }: { id: string }) => id,
    );
    return allUsers.filter(
      ({ id }: { id: string }) =>
        id !== process.env.APP_ID && !existingUsersIds.includes(id),
    );
  }

  public findContent(
    array: AppCommand[],
    objName: Commands,
  ): string | undefined {
    return array.find((obj) => obj.name === objName)?.content;
  }
}
