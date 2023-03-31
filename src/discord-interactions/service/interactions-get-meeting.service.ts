import { config } from 'dotenv';
import { Injectable } from '@nestjs/common';
import { DiscordUserDTO } from '../dto/Discord-user.dto';
import { AppUserDTO } from '../../users/dto/App-user.dto';
import { UsersService } from '../../users/providers/users.service';
import { commandsSelectComponents } from 'src/app-SETUP/commands-select-components.list';
import { StateService } from '../../app-state/state.service';
import { ResponseComponentsProvider } from './response-components.provider';
import { CalendarService } from '../Calendar-service/Calendar.service';
import { MeetingService } from '../Meeting/Meeting.service';
import { Meeting } from '../Meeting/interface/Meeting.interface';
import { FreeBusyRanges } from '../Calendar-service/types/Free-busy-ranges.type';

config();

@Injectable()
export class InteractionsGetMeetingService {
  constructor(
    private readonly usersService: UsersService,
    private readonly stateService: StateService,
    private readonly responseComponentsProvider: ResponseComponentsProvider,
    private readonly meetingService: MeetingService,
    private readonly calendarService: CalendarService,
  ) {}

  async meetingBookingCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    const meetingData: Partial<Meeting> =
      this.meetingService.rebuildMeetingData({
        userDId: discordUser.id,
        hostDId: custom_id.split(':')[1],
      });

    await this.stateService.saveDataAsSession(
      discordUser.id,
      JSON.stringify(meetingData),
      'continuationBuildingMeeting',
    );

    const host: AppUserDTO | undefined = await this.usersService.getUserByDId(
      custom_id.split(':')[1],
    );
    if (!host)
      return this.responseComponentsProvider.generateIntegrationResponse({
        id,
        token,
        type: 7,
        content: `try again... starting from slash command`,
      });
    // NOT WAITING FOR IT !!
    this.calendarService.getTokens(host.dId, host.aId);

    return this.responseComponentsProvider.generateIntegrationResponse({
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
    const prevMeetingData: string | undefined =
      await this.stateService.loadDataForUserId(
        discordUser.id,
        'continuationBuildingMeeting',
      );

    if (!prevMeetingData)
      return this.responseComponentsProvider.generateIntegrationResponse({
        id,
        token,
        type: 7,
        content: `try again... starting from slash command`,
      });

    const meetingData: Partial<Meeting> =
      this.meetingService.rebuildMeetingData(
        {
          topic: values[0],
        },
        JSON.parse(prevMeetingData),
      );

    await this.stateService.saveDataAsSession(
      discordUser.id,
      JSON.stringify(meetingData),
      'continuationBuildingMeeting',
    );

    return this.responseComponentsProvider.generateIntegrationResponse({
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
    const prevMeetingData: string | undefined =
      await this.stateService.loadDataForUserId(
        discordUser.id,
        'continuationBuildingMeeting',
      );
    if (!prevMeetingData)
      return this.responseComponentsProvider.generateIntegrationResponse({
        id,
        token,
        type: 7,
        content: `try again... starting from slash command`,
      });

    const { userDId, hostDId } = JSON.parse(prevMeetingData);
    const {
      user,
      host,
      errorResponse,
    }: {
      user: AppUserDTO;
      host: AppUserDTO;
      errorResponse: string | undefined;
    } = await this.meetingService.takeAndValidateUserAndHost({
      userDId,
      hostDId,
    });
    if (errorResponse) {
      return this.responseComponentsProvider.generateIntegrationResponse({
        id,
        token,
        type: 7,
        content:
          "Host didn't auth the app and connect his calander yet. Let him know about this fact to book a meeting!",
      });
    }

    const prevMeetingDataObj: Partial<Meeting> = JSON.parse(prevMeetingData);

    const meetingData: Partial<Meeting> =
      this.meetingService.rebuildMeetingData(
        {
          userDId,
          hostDId,
          hostAId: host.aId,
          summary: `Meeting with ${user.username}`,
          description: `Meeting with ${user.username} (${
            user.name
          }) created ${new Date().toISOString()}: ${prevMeetingDataObj.topic}`,
          guestEmail: user.email,
          hostEmail: host.email,
        },
        prevMeetingDataObj,
      );

    await this.stateService.saveDataAsSession(
      discordUser.id,
      JSON.stringify(meetingData),
      'continuationBuildingMeeting',
    );

    const durationMs = Number(values[0]);

    const {
      data: meetingTimeProposals,
      error,
    }: { data: FreeBusyRanges; error: string } =
      await this.calendarService.getMeetingTimeProposals(hostDId, durationMs);

    if (error) {
      return this.responseComponentsProvider.generateIntegrationResponse({
        id,
        token,
        type: 7,
        content: error,
      });
    }

    const split = (objArr: any[]) => {
      const arr = [];
      for (let i = 0; i < objArr.length; i += 24) {
        arr.push(objArr.slice(i, i + 24));
      }
      return arr;
    };

    const splitted = split(meetingTimeProposals);

    return await this.responseComponentsProvider.generateIntegrationResponseMultiline(
      {
        id,
        token,
        type: 7,
        content: 'Choose your time:',
        componentsArrays: splitted.slice(0, 5).map((set: any[], i) =>
          commandsSelectComponents.meetingDetailsTime.map((component) => ({
            ...component,
            custom_id: `${component.custom_id}:${i}`,
            options: set.map(
              ({ start, end }: { start: string; end: string }) => {
                const startD = new Date(start);
                const endD = new Date(end);
                return {
                  label: `${startD.toDateString()}, ${startD.toLocaleTimeString(
                    undefined,
                    { timeStyle: 'short' },
                  )} - ${endD.toDateString()}, ${endD.toLocaleTimeString(
                    undefined,
                    {
                      timeStyle: 'short',
                    },
                  )}`,
                  value: `${start.toString()}/${end.toString()}`,
                };
              },
            ),
          })),
        ),
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

    const prevMeetingData: string | undefined =
      await this.stateService.loadDataForUserId(
        discordUser.id,
        'continuationBuildingMeeting',
      );

    if (!prevMeetingData)
      return this.responseComponentsProvider.generateIntegrationResponse({
        id,
        token,
        type: 7,
        content: `try again... starting from slash command`,
      });

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

    if (error) {
      return this.responseComponentsProvider.generateIntegrationResponse({
        id,
        token,
        type: 7,
        content: error,
      });
    }
    await this.stateService.removeDataForUserId(
      discordUser.id,
      'continuationBuildingMeeting',
    );

    return this.responseComponentsProvider.generateIntegrationResponse({
      id,
      token,
      type: 7,
      content: `Your meeting is booked!`,
    });
  }
}
