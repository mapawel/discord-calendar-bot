import { Injectable } from '@nestjs/common';
import { InteractionResponseType } from 'discord-interactions';
import { DiscordUserDTO } from '../dto/Discord-user.dto';
import { AppUserDTO } from 'src/users/dto/App-user.dto';
import { config } from 'dotenv';
import { AppRoutes } from 'src/app-routes/app-routes.enum';
import { commandsComponents } from 'src/app-SETUP/commands-components.list';
import { UsersService } from 'src/users/providers/users.service';
import { commands } from 'src/app-SETUP/commands.list';
import { Commands } from 'src/app-SETUP/commands.enum';
import { ResponseComponentsProvider } from './response-components.provider';
import { CommandsComponents } from 'src/app-SETUP/commands-components.enum';
import axios from 'axios';
config();

@Injectable()
export class IntegrationSlashCommandsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly responseComponentsProvider: ResponseComponentsProvider,
  ) {}

  responseWithPong() {
    return {
      type: InteractionResponseType.PONG,
    };
  }

  async loggonManagementAuthzApi(discordUser: DiscordUserDTO) {
    try {
      console.log(await this.usersService.getUserByDId('1084210621903540376'));

      // GET TOKEN FROM AUTHZ MANAGEMENT TO CALL FOR TOKEN FOR GOOGLE
      // const { data } = await axios({
      //   method: 'POST',
      //   url: 'https://discord-calendar-bot-by-dd.eu.auth0.com/oauth/token',
      //   headers: { 'content-type': 'application/json' },
      //   data: {
      //     client_id: process.env.AUTHZ_CLIENT_ID,
      //     client_secret: process.env.AUTHZ_SECRET,
      //     audience: 'https://discord-calendar-bot-by-dd.eu.auth0.com/api/v2/',
      //     grant_type: 'client_credentials',
      //   },
      // });

      // console.log('data1 ----> ', data);

      // GET A USER ID FOR MENTOR?
      // const { data: data2 } = await axios({
      //   method: 'GET',
      //   url: `https://discord-calendar-bot-by-dd.eu.auth0.com/api/v2/users-by-email`,
      //   headers: {
      //     'content-type': 'application/json',
      //     Authorization: `Bearer ${data.access_token}`,
      //   },
      //   params: {
      //     email: 'michalpawlowski2020@gmail.com',
      //   },
      // });

      // console.log('!!!!! data2 ----> ', data2);

      // GET TOKEN FOR GOOGLW FROM AUTHZ
      // const { data: data2 } = await axios({
      //   method: 'GET',
      //   url: `https://discord-calendar-bot-by-dd.eu.auth0.com/api/v2/users/google-oauth2|109400188660500895432`,
      //   headers: {
      //     'content-type': 'application/json',
      //     Authorization: `Bearer ${data.access_token}`,
      //   },
      // });

      // console.log('!!!!! data2 ----> ', data2.identities[0].access_token);

      // BOOK A MEETING
      // const { data: data3 } = await axios({
      //   method: 'POST',
      //   url: `https://www.googleapis.com/calendar/v3/calendars/79217e66718fdf78cb38c6409dc24d003b535cbfbe83cb51efcc2f590a62b52c@group.calendar.google.com/events`,
      //   headers: {
      //     'content-type': 'application/json',
      //     Authorization: `Bearer ${data2.identities[0].access_token}`,
      //   },
      //   data: {
      //     summary: 'Summary field2',
      //     description: 'A description2.',
      //     start: {
      //       dateTime: '2023-03-27T16:30:00+02:00',
      //     },
      //     end: {
      //       dateTime: '2023-03-27T16:45:00+02:00',
      //     },
      //     attendees: [{ email: 'lpage@example.com' }],
      //     reminders: {
      //       useDefault: false,
      //       overrides: [
      //         { method: 'email', minutes: 24 * 60 },
      //         { method: 'popup', minutes: 10 },
      //       ],
      //     },
      //   },
      // });
      // console.log('data3 ----> ', data3);
      // CHECK IF MENTOR IS FREE
      // const { data: data3 } = await axios({
      //   method: 'POST',
      //   url: `https://www.googleapis.com/calendar/v3/freeBusy`,
      //   headers: {
      //     'content-type': 'application/json',
      //     Authorization: `Bearer ${data2.identities[0].access_token}`,
      //   },
      //   data: {
      //     timeMin: '2023-03-27T10:00:00+02:00',
      //     timeMax: '2023-03-27T20:00:00+02:00',
      //     timeZone: 'UTX+02:00',
      //     // groupExpansionMax: integer,
      //     // calendarExpansionMax: integer,
      //     items: [
      //       {
      //         id: '79217e66718fdf78cb38c6409dc24d003b535cbfbe83cb51efcc2f590a62b52c@group.calendar.google.com',
      //       },
      //     ],
      //   },
      // });
      // console.log('data3 ----> ', JSON.stringify(data3, null, 2));
    } catch (err) {
      console.log(JSON.stringify(err.response.data, null, 2));
    }
  }

  async responseForMeeting(discordUser: DiscordUserDTO) {
    const foundUser: AppUserDTO | undefined =
      await this.usersService.getWhitelistedUser(discordUser.id);

    // if (foundUser?.connections.length) {
    //   return this.responseComponentsProvider.generateIntegrationResponse({
    //     content: 'Choose a person to meet with:',
    //     components: foundUser?.connections.map((connectedUser) => ({
    //       ...commandsComponents.mentorToMeetWithButton[0],
    //       label: connectedUser.username,
    //       custom_id: CommandsComponents.MEETING_CALLBACK + connectedUser.id,
    //     })),
    //   });
    // } else {
    return this.responseComponentsProvider.generateIntegrationResponse({
      content: 'You have no contacts to meet with. Please contact an admin.',
    });
    // }
  }

  async authenticate(discordUser: DiscordUserDTO) {
    await this.usersService.createUserIfNotExisting(discordUser);

    return this.responseComponentsProvider.generateIntegrationResponse({
      components: [
        {
          type: 2,
          label: this.responseComponentsProvider.findContent(
            commands,
            Commands.AUTHENTICATE,
          ),
          style: 5,
          url: `${process.env.APP_BASE_URL}${AppRoutes.LOGIN_CONTROLLER}${AppRoutes.LOGIN_METHOD}?id=${discordUser.id}`,
        },
      ],
    });
  }

  async managingBot() {
    return this.responseComponentsProvider.generateIntegrationResponse({
      content: this.responseComponentsProvider.findContent(
        commands,
        Commands.BOT_MANAGE,
      ),
      components: commandsComponents.managingBot,
    });
  }

  public async default(discordUser: DiscordUserDTO, values: string[]) {
    return this.responseComponentsProvider.generateIntegrationResponse({
      content: 'No action implemented for this command yet.',
    });
  }
}
