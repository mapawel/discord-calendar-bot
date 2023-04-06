import { Injectable } from '@nestjs/common';
import { DiscordUserDTO } from '../../../discord-interactions/dto/Discord-user.dto';
import { AppUserDTO } from '../../../users/dto/App-user.dto';
import { UsersService } from '../../../users/providers/users.service';
import { commandsSelectComponents } from '../../../app-SETUP/lists/commands-select-components.list';
import { ResponseComponentsProvider } from '../response-components.provider';
import { CalendarService } from '../../../Calendar/Calendar.service';
import { Meeting } from '../../Meeting/Meeting.interface';
import { FreeBusyRanges } from '../../../Calendar/types/Free-busy-ranges.type';
import { AppCommandSelectComponent } from '../../../app-SETUP/lists/commands-select-components.list';
import { InteractionMessage } from 'src/discord-interactions/dto/interaction.dto';

@Injectable()
export class InteractionsGetMeetingService {
  constructor(
    private readonly usersService: UsersService,
    private readonly responseComponentsProvider: ResponseComponentsProvider,
    private readonly calendarService: CalendarService,
  ) {}

  async meetingChooseMentorCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
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
    if (error) return this.respondWithError(id, token, error);

    return this.responseComponentsProvider.generateInteractionResponse({
      id,
      token,
      type: 7,
      content: `Choose a topic:`,
      components: commandsSelectComponents.meetingDetailsTopics,
      embed: {
        title: `Creating a meeting:`,
        fields: [
          {
            name: `Host: ${host.username} (${host.email})`,
            value: host.dId,
          },
          {
            name: `Guest: ${user.username} (${user.email})`,
            value: user.dId,
          },
        ],
      },
    });
  }

  public async meetingDetailsTopicCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
    components: any[],
    message: InteractionMessage,
  ) {
    const topic: string = values[0];
    const { embeds } = message;
    const currentEmbedFields = embeds[0].fields;
    //TODO type this

    return this.responseComponentsProvider.generateInteractionResponse({
      id,
      token,
      type: 7,
      content: `Choose meeting duration:`,
      components: commandsSelectComponents.meetingDetailsDuration,
      embed: {
        title: `Creating a meeting:`,
        fields: [
          ...currentEmbedFields,
          {
            name: `Topic:`,
            value: topic,
          },
        ],
      },
    });
  }

  public async meetingDetailsDurationCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
    components: any[],
    message: InteractionMessage,
  ) {
    const durationMs = Number(values[0]);
    const { embeds } = message;
    const currentEmbedFields = embeds[0].fields;
    const hostDId: string = currentEmbedFields[0].value;

    const {
      data: meetingTimeProposals,
      error,
    }: { data: FreeBusyRanges; error: string } =
      await this.calendarService.getMeetingTimeProposals(hostDId, durationMs);

    if (error) return this.respondWithError(id, token, error);

    const splittedTimeProposals = this.splitArrayToArrays(
      meetingTimeProposals,
      24,
    );

    const componentsArrays = this.buildSelectMultiComponentsWithTimeranges(
      splittedTimeProposals,
      commandsSelectComponents.meetingDetailsTime,
      5,
    );

    return await this.responseComponentsProvider.generateInteractionResponseMultiline(
      {
        id,
        token,
        type: 7,
        content: 'Choose your time:',
        componentsArrays,
        embed: {
          title: `Creating a meeting:`,
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
  }

  async meetingDetailsTimeCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
    components: any[],
    message: InteractionMessage,
  ) {
    const start: string = values[0].split('/')[0];
    const end: string = values[0].split('/')[1];
    const { embeds } = message;
    const currentEmbedFields = embeds[0].fields;

    const hostDId: string = currentEmbedFields[0].value;
    const hostMail: string = currentEmbedFields[0].name
      .split(' ')[2]
      .trim()
      .slice(1, -1);

    const userDId: string = currentEmbedFields[1].value;
    const username: string = currentEmbedFields[1].name.split(' ')[2];
    const userMail: string = currentEmbedFields[1].name
      .split(' ')[2]
      .trim()
      .slice(1, -1);

    const topic: string = currentEmbedFields[2].value;

    const meetingData: Meeting = {
      userDId,
      hostDId,
      topic,
      summary: `Meeting with ${username}`,
      description: topic,
      guestEmail: userMail,
      hostEmail: hostMail,
      start,
      end,
    };

    const { error }: { error: string } = await this.calendarService.bookMeeting(
      hostDId as string,
      meetingData,
    );

    if (error) return this.respondWithError(id, token, error);

    return this.responseComponentsProvider.generateInteractionResponse({
      id,
      token,
      type: 7,
      content: ``,
      embed: {
        title: `Your meeting is booked!`,
        fields: [
          ...currentEmbedFields,
          {
            name: `Meeting start:`,
            value: `${new Date(start).toLocaleTimeString('pl-PL', {
              timeStyle: 'short',
            })} ${new Date(start).toLocaleDateString('pl-PL', {
              dateStyle: 'short',
            })}`,
          },
          {
            name: `Meeting end: ${end}`,
            value: '',
          },
        ],
      },
    });
  }

  private respondWithError(id: string, token: string, message?: string) {
    return this.responseComponentsProvider.generateInteractionResponse({
      id,
      token,
      type: 7,
      content: message ? message : `try again... starting from slash command`,
    });
  }

  private splitArrayToArrays(objArr: any[], portion: number): any[][] {
    const arr = [];
    for (let i = 0; i < objArr.length; i += portion) {
      arr.push(objArr.slice(i, i + portion));
    }
    return arr;
  }

  private buildSelectMultiComponentsWithTimeranges(
    topDataArray: any[][],
    componentToMultiply: AppCommandSelectComponent[],
    sliceFirstN: number,
  ) {
    return topDataArray.slice(0, sliceFirstN).map((set: any[], i) =>
      componentToMultiply.map((component: any) => ({
        ...component,
        custom_id: `${component.custom_id}:${i}`,
        options: set.map(({ start, end }: { start: string; end: string }) => {
          const startD = new Date(start);
          const endD = new Date(end);
          return {
            label: `${startD.toDateString()}, ${startD.toLocaleTimeString(
              'pl-PL',
              { timeStyle: 'short' },
            )} - ${endD.toDateString()}, ${endD.toLocaleTimeString('pl-PL', {
              timeStyle: 'short',
            })}`,
            value: `${start.toString()}/${end.toString()}`,
          };
        }),
      })),
    );
  }
}
