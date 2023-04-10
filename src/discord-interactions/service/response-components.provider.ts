import { Injectable } from '@nestjs/common';
import { DiscordApiService } from '../../APIs/Discord-api.service';
import { DiscordInteractionException } from '../exception/Discord-interaction.exception';
import { AppAllCommandComponentsType } from '../../app-SETUP/lists/types/App-all-types-component.type';
import { AxiosResponse } from 'axios';
import { isStatusValid } from '../../APIs/APIs.helpers';
import { InteractionModalComponentArgs } from '../types/Interaction-modal-component-args.type';
import {
  InteractionResponseArgs,
  InteractionResponseMultilineArgs,
} from '../types/Interaction-response-components.type';

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
  }: InteractionResponseMultilineArgs) {
    try {
      const { status }: AxiosResponse =
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
                ? componentsArrays.map(
                    (components: AppAllCommandComponentsType[]) => ({
                      type: 1,
                      components,
                    }),
                  )
                : [],
            },
          },
        });
      if (!isStatusValid(status)) {
        throw new Error(
          `Error while generating interaction response: ${status}`,
        );
      }
    } catch (err: any) {
      throw new DiscordInteractionException(err?.message, { causeErr: err });
    }
  }

  public async generateInteractionResponse({
    id,
    token,
    type,
    content,
    components,
    embed,
  }: InteractionResponseArgs) {
    try {
      const { status }: AxiosResponse =
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
      if (!isStatusValid(status)) {
        throw new Error(
          `Error while generating interaction response: ${status}`,
        );
      }
    } catch (err: any) {
      throw new DiscordInteractionException(err?.message, { causeErr: err });
    }
  }

  public async generateOneInputModal({
    id,
    token,
    component,
  }: InteractionModalComponentArgs) {
    const [data] = component;
    try {
      const { status }: AxiosResponse =
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
      if (!isStatusValid(status)) {
        throw new Error(
          `Error while generating interaction response: ${status}`,
        );
      }
    } catch (err: any) {
      throw new DiscordInteractionException(err?.message, { causeErr: err });
    }
  }
}
