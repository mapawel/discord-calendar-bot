import { Injectable } from '@nestjs/common';
import { InteractionResponseType } from 'discord-interactions';
import { config } from 'dotenv';
import { DiscordApiService } from 'src/APIs/Discord-api.service';
import { DiscordInteractionException } from '../exception/DiscordInteraction.exception';
import { AppCommandModalComponent } from 'src/app-SETUP/lists/commands-modal-components.list';

config();

@Injectable()
export class ResponseComponentsProvider {
  constructor(private readonly discordApiService: DiscordApiService) {}

  public async generateInteractionResponseMultiline({
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

  public async generateInteractionResponse({
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
                    min_length: 1,
                    max_length: 4000,
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
}
