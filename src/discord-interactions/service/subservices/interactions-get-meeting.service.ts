import { Injectable } from '@nestjs/common';
import { DiscordUserDTO } from '../../../discord-interactions/dto/Discord-user.dto';
import { AppUserDTO } from '../../../users/dto/App-user.dto';
import { UsersService } from '../../../users/providers/users.service';
import { commandsSelectComponents } from '../../../app-SETUP/lists/commands-select-components.list';
import { StateService } from '../../../app-state/State.service';
import { ResponseComponentsProvider } from '../response-components.provider';
import { CalendarService } from '../../../Calendar/Calendar.service';
import { MeetingService } from '../../../discord-interactions/Meeting/Meeting.service';
import { Meeting } from '../../../discord-interactions/Meeting/interface/Meeting.interface';
import { FreeBusyRanges } from '../../../Calendar/types/Free-busy-ranges.type';
import { AppCommandSelectComponent } from '../../../app-SETUP/lists/commands-select-components.list';

@Injectable()
export class InteractionsGetMeetingService {
  constructor(
    private readonly usersService: UsersService,
    private readonly stateService: StateService,
    private readonly responseComponentsProvider: ResponseComponentsProvider,
    private readonly meetingService: MeetingService,
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

    const meetingData: Partial<Meeting> =
      this.meetingService.rebuildMeetingData({
        userDId,
        hostDId,
        hostAId: host.aId,
        summary: `Meeting with ${user.username}`,
        description: `Meeting with ${user.username} (${
          user.name
        }) created ${new Date().toISOString()}`,
        guestEmail: user.email,
        hostEmail: host.email,
      });

    await this.saveMeetingData(discordUser.id, meetingData);

    return this.responseComponentsProvider.generateInteractionResponse({
      id,
      token,
      type: 7,
      content: `Choose a topic:`,
      components: commandsSelectComponents.meetingDetailsTopics,
    });
  }

  public async meetingDetailsTopicCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    const prevMeetingData: string | undefined = await this.loadMeetingData(
      discordUser.id,
    );
    if (!prevMeetingData) return this.respondWithError(id, token);
    const prevMeetingDataObj: Partial<Meeting> = JSON.parse(
      prevMeetingData || '',
    );

    const meetingData: Partial<Meeting> =
      this.meetingService.rebuildMeetingData(
        {
          summary: `${prevMeetingDataObj.summary} about: ${values[0]}`,
          topic: values[0],
        },
        prevMeetingDataObj,
      );

    await this.saveMeetingData(discordUser.id, meetingData);

    return this.responseComponentsProvider.generateInteractionResponse({
      id,
      token,
      type: 7,
      content: `Choose meeting duration:`,
      components: commandsSelectComponents.meetingDetailsDuration,
    });
  }

  public async meetingDetailsDurationCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    const durationMs = Number(values[0]);
    const prevMeetingData: string | undefined = await this.loadMeetingData(
      discordUser.id,
    );
    const prevMeetingDataObj: Partial<Meeting> = JSON.parse(
      prevMeetingData || '',
    );
    if (!prevMeetingDataObj?.hostDId) return this.respondWithError(id, token);

    const {
      data: meetingTimeProposals,
      error,
    }: { data: FreeBusyRanges; error: string } =
      await this.calendarService.getMeetingTimeProposals(
        prevMeetingDataObj.hostDId,
        durationMs,
      );

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
      },
    );
  }

  async meetingDetailsTimeCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    const start: string = values[0].split('/')[0];
    const end: string = values[0].split('/')[1];

    const prevMeetingData: string | undefined = await this.loadMeetingData(
      discordUser.id,
    );
    if (!prevMeetingData) return this.respondWithError(id, token);
    const prevMeetingDataObj: Partial<Meeting> = JSON.parse(prevMeetingData);

    const meetingData: Partial<Meeting> =
      this.meetingService.rebuildMeetingData(
        {
          start,
          end,
        },
        prevMeetingDataObj,
      );

    const { error }: { error: string } = await this.calendarService.bookMeeting(
      prevMeetingDataObj.hostDId as string,
      meetingData as Meeting,
    );

    if (error) return this.respondWithError(id, token, error);

    await this.removeMeetingData(discordUser.id);

    return this.responseComponentsProvider.generateInteractionResponse({
      id,
      token,
      type: 7,
      content: `Your meeting is booked!`,
    });
  }

  private async loadMeetingData(userDId: string): Promise<string | undefined> {
    return await this.stateService.loadDataForUserId(
      userDId,
      'continuationBuildingMeeting',
    );
  }

  private async saveMeetingData(
    userDId: string,
    meetingData: Partial<Meeting>,
  ): Promise<void> {
    return await this.stateService.saveDataAsSession(
      userDId,
      JSON.stringify(meetingData),
      'continuationBuildingMeeting',
    );
  }

  private async removeMeetingData(userDId: string): Promise<true> {
    await this.stateService.removeDataForUserId(
      userDId,
      'continuationBuildingMeeting',
    );

    return true;
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
              undefined,
              { timeStyle: 'short' },
            )} - ${endD.toDateString()}, ${endD.toLocaleTimeString(undefined, {
              timeStyle: 'short',
            })}`,
            value: `${start.toString()}/${end.toString()}`,
          };
        }),
      })),
    );
  }
}
