import { config } from 'dotenv';
import { Injectable } from '@nestjs/common';
import { DiscordUserDTO } from '../dto/Discord-user.dto';
import { AppUserDTO } from '../../users/dto/App-user.dto';
import { UsersService } from '../../users/providers/users.service';
import { commandsSelectComponents } from 'src/app-SETUP/commands-select-components.list';
import { StateService } from '../../app-state/state.service';
import { ResponseComponentsProvider } from './response-components.provider';
import { CalendarService } from '../Calendar-service/Calendar.service';
import { ResponseComponentsHelperService } from './response-components-helper.service';
import { MeetingService } from '../Meeting/Meeting.service';
import { Meeting } from '../Meeting/interface/Meeting.interface';
import { FreeBusyRanges } from '../Calendar-service/types/Free-busy-ranges.type';

config();

@Injectable()
export class IntegrationComponentsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly stateService: StateService,
    private readonly responseComponentsProvider: ResponseComponentsProvider,
    private readonly responseComponentsHelperService: ResponseComponentsHelperService,
    private readonly meetingService: MeetingService,
    private readonly calendarService: CalendarService,
  ) {}

  async meetingBookingCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
  ) {
    const lastMessageToken: string | undefined =
      await this.stateService.loadDataForUserId(
        discordUser.id,
        'continuationUserTokens',
      );

    if (!lastMessageToken)
      return this.responseComponentsProvider.generateIntegrationResponse({
        content: `try again... starting from slash command`,
      });

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
        content: `try again... starting from slash command`,
      });
    // NOT WAITING FOR IT !!
    this.calendarService.getTokens(host.dId, host.aId);

    await this.responseComponentsProvider.updateEarlierIntegrationResponse({
      lastMessageToken,
      content: `Creating a meeting...`,
    });

    await this.stateService.saveDataAsSession(
      discordUser.id,
      token,
      'continuationUserTokens',
    );

    return this.responseComponentsProvider.generateIntegrationResponse({
      content: `Choose a topic:`,
      components: commandsSelectComponents.meetingDetailsTopics,
    });
  }

  public async meetingDetailsTopicCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
  ) {
    const lastMessageToken: string | undefined =
      await this.stateService.loadDataForUserId(
        discordUser.id,
        'continuationUserTokens',
      );
    const prevMeetingData: string | undefined =
      await this.stateService.loadDataForUserId(
        discordUser.id,
        'continuationBuildingMeeting',
      );

    if (!lastMessageToken || !prevMeetingData)
      return this.responseComponentsProvider.generateIntegrationResponse({
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
    await this.stateService.saveDataAsSession(
      discordUser.id,
      token,
      'continuationUserTokens',
    );

    await this.responseComponentsProvider.updateEarlierIntegrationResponse({
      lastMessageToken,
      content: `OK`,
    });
    return this.responseComponentsProvider.generateIntegrationResponse({
      content: `Choose meeting duration:`,
      components: commandsSelectComponents.meetingDetailsDuration,
    });
  }

  public async meetingDetailsDurationCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
  ) {
    const lastMessageToken: string | undefined =
      await this.stateService.loadDataForUserId(
        discordUser.id,
        'continuationUserTokens',
      );
    const prevMeetingData: string | undefined =
      await this.stateService.loadDataForUserId(
        discordUser.id,
        'continuationBuildingMeeting',
      );
    if (!lastMessageToken || !prevMeetingData)
      return this.responseComponentsProvider.generateIntegrationResponse({
        content: `try again... starting from slash command????`,
      });

    await this.stateService.saveDataAsSession(
      discordUser.id,
      token,
      'continuationUserTokens',
    );

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
        content: error,
      });
    }

    await this.responseComponentsProvider.updateEarlierIntegrationResponse({
      lastMessageToken,
      content: `OK`,
    });

    const split = (objArr: any[]) => {
      const arr = [];
      for (let i = 0; i < objArr.length; i += 24) {
        arr.push(objArr.slice(i, i + 24));
      }
      return arr;
    };

    const splitted = split(meetingTimeProposals);
    console.log('splitted', splitted);

    return await this.responseComponentsProvider.generateIntegrationResponseMultiline(
      {
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
  ) {
    const start: string = values[0].split('/')[0];
    const end: string = values[0].split('/')[1];

    const lastMessageToken: string | undefined =
      await this.stateService.loadDataForUserId(
        discordUser.id,
        'continuationUserTokens',
      );
    const prevMeetingData: string | undefined =
      await this.stateService.loadDataForUserId(
        discordUser.id,
        'continuationBuildingMeeting',
      );

    if (!lastMessageToken || !prevMeetingData)
      return this.responseComponentsProvider.generateIntegrationResponse({
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
        content: error,
      });
    }

    await Promise.all([
      this.stateService.removeDataForUserId(
        discordUser.id,
        'continuationUserTokens',
      ),
      this.stateService.removeDataForUserId(
        discordUser.id,
        'continuationBuildingMeeting',
      ),
    ]);

    await this.responseComponentsProvider.updateEarlierIntegrationResponse({
      lastMessageToken,
      content: `OK`,
    });

    return this.responseComponentsProvider.generateIntegrationResponse({
      content: `Your meeting is booked!`,
    });
  }

  async addingUserToWhitelist(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
  ) {
    const usersToShow: DiscordUserDTO[] =
      await this.responseComponentsHelperService.getUsersToShow();

    if (!usersToShow.length)
      return this.responseComponentsProvider.generateIntegrationResponse({
        content: 'No more users to add to the whitelist.',
      });

    await this.stateService.saveDataAsSession(
      discordUser.id,
      token,
      'continuationUserTokens',
    );
    return this.responseComponentsProvider.generateIntegrationResponse({
      content: 'Choose a user to add to the whitelist:',
      components: commandsSelectComponents.managingBotSelectAdding.map(
        (component) => ({
          ...component,
          options: usersToShow.map((user) => ({
            label: user.username,
            value: user.id,
            description: user.id,
          })),
        }),
      ),
    });
  }

  async addingUserToWhitelistCallback(
    discordUser: DiscordUserDTO,
    values: string[],
  ) {
    const [userId] = values;

    const userToAdd: DiscordUserDTO =
      await this.usersService.getUserFromDiscord(userId);

    await this.usersService.updateUserWhitelistStatus(userToAdd.id, true);

    const lastMessageToken: string | undefined =
      await this.stateService.loadDataForUserId(
        discordUser.id,
        'continuationUserTokens',
      );

    if (!lastMessageToken)
      return this.responseComponentsProvider.generateIntegrationResponse({
        content: `User ${userToAdd.username} added!`,
      });

    await this.responseComponentsProvider.updateEarlierIntegrationResponse({
      lastMessageToken,
      content: `User ${userToAdd.username} added!`,
    });

    await this.stateService.removeDataForUserId(
      discordUser.id,
      'continuationUserTokens',
    );
  }

  async removingUserFromWhitelist(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
  ) {
    const usersToShow: AppUserDTO[] =
      await this.usersService.getAllWhitelistedUsers();

    if (!usersToShow.length)
      return this.responseComponentsProvider.generateIntegrationResponse({
        content: 'Nothing to remove...',
      });

    await this.stateService.saveDataAsSession(
      discordUser.id,
      token,
      'continuationUserTokens',
    );
    return this.responseComponentsProvider.generateIntegrationResponse({
      content: 'Choose user to remove from whitelist:',
      components: commandsSelectComponents.managingBotSelectRemoving.map(
        (component) => ({
          ...component,
          options: usersToShow.map((user) => ({
            label: user.username,
            value: user.dId,
            description: user.dId,
          })),
        }),
      ),
    });
  }

  async removingUserFromWhitelistCallback(
    discordUser: DiscordUserDTO,
    values: string[],
  ) {
    const [idToRemove] = values;
    await this.usersService.updateUserWhitelistStatus(idToRemove, false);

    const lastMessageToken: string | undefined =
      await this.stateService.loadDataForUserId(
        discordUser.id,
        'continuationUserTokens',
      );

    if (!lastMessageToken)
      return this.responseComponentsProvider.generateIntegrationResponse({
        content: `User id ${idToRemove} removed!`,
      });

    await this.responseComponentsProvider.updateEarlierIntegrationResponse({
      lastMessageToken,
      content: `User id ${idToRemove} removed!`,
    });

    await this.stateService.removeDataForUserId(
      discordUser.id,
      'continuationUserTokens',
    );
  }

  async settingUserConnections(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
  ) {
    const usersToShow: AppUserDTO[] = await this.usersService.getAllUsers();

    await this.stateService.saveDataAsSession(
      discordUser.id,
      token,
      'continuationUserTokens',
    );
    return this.responseComponentsProvider.generateIntegrationResponse({
      content: 'Choose a user to connect with persons to meet:',
      components: commandsSelectComponents.managingBotSelectUserToConnect.map(
        (component) => ({
          ...component,
          options: usersToShow.map((user) => ({
            label: user.dId,
            value: user.dId,
            description: user.username,
          })),
        }),
      ),
    });
  }

  async connectingUserToMentorCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
  ) {
    const [userToConnect] = values;

    const lastMessageToken: string | undefined =
      await this.stateService.loadDataForUserId(
        discordUser.id,
        'continuationUserTokens',
      );

    if (!lastMessageToken)
      return this.responseComponentsProvider.generateIntegrationResponse({
        content: `try again... starting from slash command`,
      });

    const personsToMeet: AppUserDTO[] = await this.usersService.getAllUsers();
    // TODO take users from discord with persont-to-meet role

    await this.responseComponentsProvider.updateEarlierIntegrationResponse({
      lastMessageToken,
      content: `Selected user id ${userToConnect}`,
    });

    await this.stateService.saveDataAsSession(
      discordUser.id,
      userToConnect,
      'continuationUserBinding',
    );
    await this.stateService.saveDataAsSession(
      discordUser.id,
      token,
      'continuationUserTokens',
    );
    return await this.responseComponentsProvider.generateIntegrationResponse({
      content: `User id ${userToConnect} will be able to meet with:`,
      components: commandsSelectComponents.managingBotSelectMentorToConnect.map(
        (component) => ({
          ...component,
          options: personsToMeet.map((user) => ({
            label: user.username,
            value: user.dId,
            description: user.dId,
          })),
        }),
      ),
    });
  }

  async connectingUserToMentorCallback2(
    discordUser: DiscordUserDTO,
    values: string[],
  ) {
    const [mentorToConnect] = values;

    const userToBindId: string | undefined =
      await this.stateService.loadDataForUserId(
        discordUser.id,
        'continuationUserBinding',
      );
    const lastMessageToken: string | undefined =
      await this.stateService.loadDataForUserId(
        discordUser.id,
        'continuationUserTokens',
      );

    if (!lastMessageToken || !userToBindId)
      return this.responseComponentsProvider.generateIntegrationResponse({
        content: `try again... starting from slash command`,
      });

    await this.usersService.bindUsers(userToBindId, mentorToConnect);
    await this.stateService.removeDataForUserId(
      discordUser.id,
      'continuationUserBinding',
    );
    await this.stateService.removeDataForUserId(
      discordUser.id,
      'continuationUserTokens',
    );
    return await this.responseComponentsProvider.updateEarlierIntegrationResponse(
      {
        lastMessageToken,
        content: `User connected to selected metor!`,
      },
    );
  }

  public async default() {
    return this.responseComponentsProvider.generateIntegrationResponse({
      content: 'No action implemented for this command yet.',
    });
  }
}
