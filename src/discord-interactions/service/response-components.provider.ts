import { Injectable } from '@nestjs/common';
import { InteractionResponseType } from 'discord-interactions';
import { config } from 'dotenv';
import { DiscordApiService } from 'src/APIs/Discord-api.service';
import { DiscordInteractionException } from '../exception/DiscordInteraction.exception';

config();

@Injectable()
export class ResponseComponentsProvider {
  constructor(private readonly discordApiService: DiscordApiService) {}

  public async generateIntegrationResponseMultiline({
    id,
    token,
    type,
    content,
    componentsArrays,
  }: {
    id: string;
    token: string;
    type:
      | InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE
      | InteractionResponseType.UPDATE_MESSAGE;
    content?: string;
    componentsArrays?: any[][];
  }) {
    try {
      await this.discordApiService.axiosInstance({
        method: 'POST',
        url: `/interactions/${id}/${token}/callback`,
        data: {
          type,
          data: {
            content,
            components: componentsArrays?.length
              ? componentsArrays.map((components: any) => ({
                  type: 1,
                  components,
                }))
              : [],
          },
        },
      });
    } catch (err: any) {
      throw new DiscordInteractionException(err?.message);
    }
  }

  public async generateIntegrationResponse({
    id,
    token,
    type,
    content,
    components,
  }: {
    id: string;
    token: string;
    type:
      | InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE
      | InteractionResponseType.UPDATE_MESSAGE;
    content?: string;
    components?: any[];
  }) {
    try {
      await this.discordApiService.axiosInstance({
        method: 'POST',
        url: `/interactions/${id}/${token}/callback`,
        data: {
          type,
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
        },
      });
    } catch (err: any) {
      throw new DiscordInteractionException(err?.message);
    }
  }
}
