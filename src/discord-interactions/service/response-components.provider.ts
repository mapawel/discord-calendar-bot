import { Injectable } from '@nestjs/common';
import { InteractionResponseType } from 'discord-interactions';
import { config } from 'dotenv';
import { UsersService } from 'src/users/providers/users.service';
import { AppUserDTO } from 'src/users/dto/App-user.dto';
import { DiscordUserDTO } from '../dto/Discord-user.dto';
import { AxiosProvider } from 'src/axios/provider/axios.provider';
import { AppCommand } from 'src/app-SETUP/commands.list';
import { Commands } from 'src/app-SETUP/commands.enum';
import { DiscordInteractionException } from '../exception/DiscordInteraction.exception';

config();

@Injectable()
export class ResponseComponentsProvider {
  constructor(
    private readonly usersService: UsersService,
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

  public async getUsersToShow(): Promise<DiscordUserDTO[]> {
    // TODO to refactor to speed it up!
    const allUsers: DiscordUserDTO[] =
      await this.usersService.getUsersFromDiscord();
    const alreadyWhitelistedUsers: AppUserDTO[] =
      await this.usersService.getAllWhitelistedUsers();
    const existingUsersDids: string[] = alreadyWhitelistedUsers.map(
      ({ dId }: { dId: string }) => dId,
    );
    return allUsers.filter(
      ({ id }: { id: string }) =>
        id !== process.env.APP_ID && !existingUsersDids.includes(id),
    );
  }

  public findContent(
    array: AppCommand[],
    objName: Commands,
  ): string | undefined {
    return array.find((obj) => obj.name === objName)?.content;
  }
}
