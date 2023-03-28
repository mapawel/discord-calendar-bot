import { config } from 'dotenv';
import { Injectable } from '@nestjs/common';
import { DiscordUserDTO } from '../dto/Discord-user.dto';
import { AppUserDTO } from 'src/users/dto/App-user.dto';
import { UsersService } from '../../users/providers/users.service';
import { commandsSelectComponents } from 'src/app-SETUP/commands-select-components.list';
import { StateService } from '../../app-state/state.service';
import { ResponseComponentsProvider } from './response-components.provider';
import { CalendarService } from './Calendar.service';

config();

@Injectable()
export class IntegrationComponentsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly stateService: StateService,
    private readonly responseComponentsProvider: ResponseComponentsProvider,
    private readonly calendarService: CalendarService,
  ) {}

  // TODO - UserDTO split to AppUserDTO and DiscordUserDTO
  async responseForMeetingCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
  ) {
    const userDID = discordUser.id;
    const hostDId: string = custom_id.split(':')[1];

    const [user, host]: (AppUserDTO | undefined)[] = await Promise.all(
      [userDID, hostDId].map((dId) => this.usersService.getUserByDId(dId)),
    );

    if (!user || !host) {
      throw Error('User or host not found');
    }
    if (!host.aId) {
      return this.responseComponentsProvider.generateIntegrationResponse({
        content:
          "Host didn't auth the app and connect his calander yet. Let him know about this fact to book a meeting!",
      });
    }

    const authManagementToken: string =
      await this.calendarService.getTokenForAuthManagment();

    const googleToken: string = await this.calendarService.getTokenForGoogle(
      authManagementToken,
      host.aId,
    );

    const calendarId: string = await this.calendarService.getMentorsCalendarId(
      googleToken,
    );
    console.log(
      'new Date().toString() ----> ',
      new Date().toISOString().toString(),
    );
    const meeting = {
      start: new Date().toISOString().toString(),
      end: new Date(Date.now() + 3600000).toISOString().toString(),
      summary: `Meeting with ${user.name} (${user.username})`,
      description: `Meeting with ${user.name}`,
      guestEmail: user.email,
      hostEmail: host.email,
    };

    await this.calendarService.bookMeeting({
      googleToken,
      calendarId,
      meeting,
    });

    return this.responseComponentsProvider.generateIntegrationResponse({
      content: `Meeting: ${user.name} ${host.name}`,
    });
  }

  async addingUserToWhitelist(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
  ) {
    const usersToShow: DiscordUserDTO[] =
      await this.responseComponentsProvider.getUsersToShow();

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
    token: string,
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

    //TODO Add filter for the same user which is setting connections and BOT
    // if (!usersToShow.length)
    //   return this.responseComponentsProvider.generateIntegrationResponse({
    //     content: 'No users to connect with persons to meet.',
    //   });

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

    console.log(' userToBindId----> ', userToBindId);
    console.log(' mentorToConnect----> ', mentorToConnect);

    if (!lastMessageToken || !userToBindId)
      return this.responseComponentsProvider.generateIntegrationResponse({
        content: `try again... starting from slash command`,
      });

    //logic to bind
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

  public async default(discordUser: DiscordUserDTO, values: string[]) {
    return this.responseComponentsProvider.generateIntegrationResponse({
      content: 'No action implemented for this command yet.',
    });
  }
}
