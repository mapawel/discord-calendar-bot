import { Injectable } from '@nestjs/common';
import { InteractionResponseType } from 'discord-interactions';
import { config } from 'dotenv';
import { UsersService } from 'src/users/providers/users.service';
import { AxiosProvider } from 'src/axios/provider/axios.provider';
import { DiscordInteractionException } from '../exception/DiscordInteraction.exception';

config();

@Injectable()
export class ResponseComponentsProvider {
  constructor(
    private readonly usersService: UsersService,
    private readonly axiosProvider: AxiosProvider,
  ) {}

  public generateIntegrationResponseMultiline({
    content,
    componentsArrays,
  }: {
    content?: string;
    componentsArrays?: any[][];
  }) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content,
        components: componentsArrays?.length
          ? componentsArrays.map((components: any) => ({
              type: 1,
              components,
            }))
          : [],
      },
    };
  }

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
      console.log('JSON ----> ', JSON.stringify(err, null, 2));
      throw new DiscordInteractionException(err?.message);
    }
  }

  // public async generateRESTIntegrationResponse({
  //   id,
  //   token,
  //   content,
  //   components,
  // }: {
  //   id: string;
  //   token: string;
  //   content: string;
  //   components?: any[];
  // }) {
  //   try {
  //     await this.axiosProvider.instance({
  //       method: 'POST',
  //       url: `/interactions/${id}/${token}/callback`,
  //       data: {
  //         type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
  //         data: {
  //           content,
  //           components: components?.length
  //             ? [
  //                 {
  //                   type: 1,
  //                   components,
  //                 },
  //               ]
  //             : [],
  //         },
  //       },
  //     });
  //   } catch (err: any) {
  //     console.log('JSON ----> ', JSON.stringify(err, null, 2));
  //     throw new DiscordInteractionException(err?.message);
  //   }
  // }
}
