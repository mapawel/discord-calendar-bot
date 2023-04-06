import { Injectable } from '@nestjs/common';
import { InteractionResponseType } from 'discord-interactions';
import { DiscordApiService } from 'src/APIs/Discord-api.service';
import { DiscordInteractionException } from '../exception/DiscordInteraction.exception';
import { AppCommandModalComponent } from 'src/app-SETUP/lists/commands-modal-components.list';

@Injectable()
export class ResponseComponentsProvider {
  constructor(private readonly discordApiService: DiscordApiService) {}

  public async generateInteractionResponseMultiline({
    id,
    token,
    type,
    content,
    componentsArrays,
    embed,
  }: {
    id: string;
    token: string;
    type:
      | InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE
      | InteractionResponseType.UPDATE_MESSAGE;
    content?: string;
    componentsArrays?: any[][];
    embed?: { title: string; fields: { name: string; value: string }[] };
  }) {
    try {
      await this.discordApiService.axiosInstance({
        method: 'POST',
        url: `/interactions/${id}/${token}/callback`,
        data: {
          type,
          data: {
            embeds: embed
              ? [
                  {
                    title: embed.title,
                    color: 0x00f00,
                    fields: embed.fields,
                    footer: {
                      text: content,
                    },
                  },
                ]
              : [],
            content: embed ? null : content,
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

  public async generateInteractionResponse({
    id,
    token,
    type,
    content,
    components,
    embed,
  }: {
    id: string;
    token: string;
    type:
      | InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE
      | InteractionResponseType.UPDATE_MESSAGE;
    content?: string;
    components?: any[];
    embed?: { title: string; fields: { name: string; value: string }[] };
  }) {
    try {
      await this.discordApiService.axiosInstance({
        method: 'POST',
        url: `/interactions/${id}/${token}/callback`,
        data: {
          type,
          data: {
            embeds: embed
              ? [
                  {
                    title: embed.title,
                    color: 0x00f00,
                    fields: embed.fields,
                    footer: {
                      text: content,
                    },
                  },
                ]
              : [],
            content: embed ? null : content,
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

  public async generateOneInputModal({
    id,
    token,
    component,
  }: {
    id: string;
    token: string;
    component: AppCommandModalComponent[];
  }) {
    const [data] = component;
    try {
      await this.discordApiService.axiosInstance({
        method: 'POST',
        url: `/interactions/${id}/${token}/callback`,
        data: {
          type: 9,
          data: {
            title: data.modal_title,
            custom_id: data.custom_id,
            components: [
              {
                type: 1,
                components: [
                  {
                    type: 4,
                    custom_id: `${data.custom_id}-input`,
                    label: data.component_label,
                    style: 1,
                    min_length: data.component_min_l,
                    max_length: data.component_max_l,
                    placeholder: data.component_placeholder,
                    required: true,
                  },
                ],
              },
            ],
          },
        },
      });
    } catch (err: any) {
      throw new DiscordInteractionException(err?.message);
    }
  }

  // // TO SHOW WHITELIST ETC - TO FINISH
  public async generateEmbedResponse({
    id,
    token,
  }: // component,
  {
    id: string;
    token: string;
    // component: AppCommandModalComponent[];
  }) {
    try {
      await this.discordApiService.axiosInstance({
        method: 'POST',
        url: `/interactions/${id}/${token}/callback`,
        data: {
          type: 4,
          data: {
            embeds: [
              {
                title: 'titel',
                description: 'description',
                color: 0x00ff0,
                fields: [
                  {
                    name: 'Field 1',
                    value: 'Some value here',
                    inline: true,
                  },
                  {
                    name: 'Field 2',
                    value: 'Some value here',
                    inline: true,
                  },
                ],
              },
            ],
          },
        },
      });
    } catch (err: any) {
      throw new DiscordInteractionException(err?.message);
    }
  }
}
