import { Injectable } from '@nestjs/common';
import { AppUserDTO } from '../../../users/dto/App-user.dto';
import { UsersService } from '../../../users/providers/users.service';
import { commandsSelectComponents } from '../../../app-SETUP/lists/commands-select-components.list';
import { ResponseComponentsProvider } from '../response-components.provider';
import { HostCalendarService } from '../../../Host-calendar/services/Host-calendar.service';
import { Meeting } from '../../Meeting/Meeting.interface';
import { FreeBusyRanges } from '../../../Host-calendar/types/Free-busy-ranges.type';
import { AppCommandSelectComponent } from '../../../app-SETUP/lists/commands-select-components.list';
import { InteractionMessageDTO } from '../../../discord-interactions/dto/Interaction-message.dto';
import { embedTitles } from '../../../app-SETUP/lists/embed-titles.list';
import { InteractionEmbedFieldDTO } from '../../../discord-interactions/dto/Interaction-embed-field.dto';
import { EmbedFieldsMeeting } from '../../../discord-interactions/Meeting/EmbedFieldsMeeting.type';
import { DiscordInteractionException } from '../../../discord-interactions/exception/Discord-interaction.exception';
import { InteractionResponseType } from 'discord-interactions';
import { InteractionBodyFieldsType } from 'src/discord-interactions/types/Body-fields.type';

@Injectable()
export class InteractionsGetMeetingService {
  constructor(
    private readonly usersService: UsersService,
    private readonly responseComponentsProvider: ResponseComponentsProvider,
    private readonly hostCalendarService: HostCalendarService,
  ) {}

  async getMeetingSelectMentor(
    interactionBodyFieldsType: InteractionBodyFieldsType,
  ) {
    try {
      const { discordUser, id, token, custom_id }: InteractionBodyFieldsType =
        interactionBodyFieldsType;

      const userDId: string = discordUser.id;
      const hostDId: string = custom_id.split(':')[1];

      const {
        user,
        host,
        error,
      }: {
        user: AppUserDTO;
        host: AppUserDTO;
        error: string | undefined;
      } = await this.usersService.takeAndValidateUserAndHost({
        userDId,
        hostDId,
      });
      if (error) return await this.responseWithError(id, token, error);

      await this.responseComponentsProvider.generateInteractionResponse({
        id,
        token,
        type: InteractionResponseType.UPDATE_MESSAGE,
        content: `Choose a topic:`,
        components: commandsSelectComponents.meetingDetailsTopics,
        embed: {
          title: embedTitles.creatingMeeting.title,
          fields: [
            {
              name: this.constructPersonString(host, 'Host'),
              value: host.dId,
            },
            {
              name: this.constructPersonString(user, 'Guest'),
              value: user.dId,
            },
          ],
        },
      });
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  public async getMeetingSelectTopic(
    interactionBodyFieldsType: InteractionBodyFieldsType,
  ) {
    try {
      const { id, token, values, message }: InteractionBodyFieldsType =
        interactionBodyFieldsType;

      const topic: string = values[0];
      const currentEmbedFields: InteractionEmbedFieldDTO[] =
        this.extractFieldsFromMessage(message);

      await this.responseComponentsProvider.generateInteractionResponse({
        id,
        token,
        type: InteractionResponseType.UPDATE_MESSAGE,
        content: `Choose meeting duration:`,
        components: commandsSelectComponents.meetingDetailsDuration,
        embed: {
          title: embedTitles.creatingMeeting.title,
          fields: [
            ...currentEmbedFields,
            {
              name: `Topic:`,
              value: topic,
            },
          ],
        },
      });
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  public async getMeetingSelectDuration(
    interactionBodyFieldsType: InteractionBodyFieldsType,
  ) {
    try {
      const { id, token, values, message }: InteractionBodyFieldsType =
        interactionBodyFieldsType;

      const durationMs = Number(values[0]);
      const currentEmbedFields = this.extractFieldsFromMessage(message);
      const hostDId: string = currentEmbedFields[0].value;

      const {
        data: meetingTimeProposals,
        error,
      }: { data: FreeBusyRanges; error: string } =
        await this.hostCalendarService.getMeetingTimeProposals(
          hostDId,
          durationMs,
        );

      if (error) return await this.responseWithError(id, token, error);

      const splittedTimeProposals: FreeBusyRanges[] = this.splitArrayToArrays(
        meetingTimeProposals,
        24,
      );

      const componentsArrays = this.buildSelectMultiComponentsWithTimeranges(
        splittedTimeProposals,
        commandsSelectComponents.meetingDetailsTime,
        5,
      );

      await this.responseComponentsProvider.generateInteractionResponseMultiline(
        {
          id,
          token,
          type: InteractionResponseType.UPDATE_MESSAGE,
          content: 'Choose your time:',
          componentsArrays,
          embed: {
            title: embedTitles.creatingMeeting.title,
            fields: [
              ...currentEmbedFields,
              {
                name: `Duration:`,
                value: `${durationMs / 1000 / 60} minutes`,
              },
            ],
          },
        },
      );
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  async getMeetingSelectTime(
    interactionBodyFieldsType: InteractionBodyFieldsType,
  ) {
    try {
      const { id, token, values, message }: InteractionBodyFieldsType =
        interactionBodyFieldsType;

      const start: string = values[0].split('/')[0];
      const end: string = values[0].split('/')[1];
      const currentEmbedFields = this.extractFieldsFromMessage(message);
      const {
        hostDId,
        hostEmail,
        userDId,
        username,
        userEmail,
        topic,
      }: EmbedFieldsMeeting =
        this.extractMeetingDataFromEmbedFields(currentEmbedFields);

      const meetingData: Meeting = {
        userDId,
        hostDId,
        topic,
        summary: `Meeting with ${username}`,
        description: topic,
        guestEmail: userEmail,
        hostEmail: hostEmail,
        start,
        end,
      };

      const { error }: { error: string } =
        await this.hostCalendarService.bookMeeting(
          hostDId as string,
          meetingData,
        );

      if (error) return await this.responseWithError(id, token, error);

      await this.responseComponentsProvider.generateInteractionResponse({
        id,
        token,
        type: InteractionResponseType.UPDATE_MESSAGE,
        content: ``,
        embed: {
          title: embedTitles.meetingBooked.title,
          fields: [
            ...currentEmbedFields,
            {
              name: `Meeting start:`,
              value: this.constructShortDate(start),
            },
            {
              name: `Meeting end:`,
              value: this.constructShortDate(end),
            },
          ],
        },
      });
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  private async responseWithError(id: string, token: string, message?: string) {
    try {
      await this.responseComponentsProvider.generateInteractionResponse({
        id,
        token,
        type: InteractionResponseType.UPDATE_MESSAGE,
        content: message ? message : `try again... starting from slash command`,
      });
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  private splitArrayToArrays(
    objArr: FreeBusyRanges,
    portion: number,
  ): FreeBusyRanges[] {
    const arr = [];
    for (let i = 0; i < objArr.length; i += portion) {
      arr.push(objArr.slice(i, i + portion));
    }
    return arr;
  }

  private buildSelectMultiComponentsWithTimeranges(
    topDataArray: FreeBusyRanges[],
    componentToMultiply: AppCommandSelectComponent[],
    sliceFirstN: number,
  ): AppCommandSelectComponent[][] {
    return topDataArray.slice(0, sliceFirstN).map((set: FreeBusyRanges, i) =>
      componentToMultiply.map((component: AppCommandSelectComponent) => ({
        ...component,
        custom_id: `${component.custom_id}:${i}`,
        options: set.map(({ start, end }: { start: string; end: string }) => {
          return {
            label: `${this.constructShortDate(
              start,
            )} - ${this.constructShortDate(end)}`,
            value: `${start}/${end}`,
            description: null,
          };
        }),
      })),
    );
  }

  private constructPersonString(
    person: AppUserDTO,
    role: 'Host' | 'Guest',
  ): string {
    return `${role}: ${person.username} (${person.email})`;
  }

  private extractFieldsFromMessage(
    message: InteractionMessageDTO,
  ): InteractionEmbedFieldDTO[] {
    const { embeds }: { embeds: { fields: InteractionEmbedFieldDTO[] }[] } =
      message;
    return embeds[0].fields;
  }

  private extractMeetingDataFromEmbedFields(
    fields: InteractionEmbedFieldDTO[],
  ): EmbedFieldsMeeting {
    const hostDId: string = fields[0].value;
    const hostEmail: string = fields[0].name.split(' ')[2].trim().slice(1, -1);

    const userDId: string = fields[1].value;
    const username: string = fields[1].name.split(' ')[2];
    const userEmail: string = fields[1].name.split(' ')[2].trim().slice(1, -1);

    const topic: string = fields[2].value;

    return {
      hostDId,
      hostEmail,
      userDId,
      username,
      userEmail,
      topic,
    };
  }

  private constructShortDate(dateString: string): string {
    return `${new Date(dateString).toLocaleTimeString('pl-PL', {
      timeStyle: 'short',
    })}, ${new Date(dateString).toLocaleDateString('pl-PL', {
      dateStyle: 'short',
    })}`;
  }
}
