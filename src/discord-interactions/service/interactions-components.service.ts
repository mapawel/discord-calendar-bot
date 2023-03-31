import { config } from 'dotenv';
import { Injectable } from '@nestjs/common';
import { DiscordUserDTO } from '../dto/Discord-user.dto';
import { ResponseComponentsProvider } from './response-components.provider';
import { InteractionsGetMeetingService } from './interactions-get-meeting.service';
import { InteractionsBotManagingService } from './interactions-bot-managing.service';

config();

@Injectable()
export class IntegrationComponentsService {
  constructor(
    private readonly responseComponentsProvider: ResponseComponentsProvider,
    private readonly interactionsGetMeetingService: InteractionsGetMeetingService,
    private readonly interactionsBotManagingService: InteractionsBotManagingService,
  ) {}

  async meetingBookingCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    return this.interactionsGetMeetingService.meetingBookingCallback(
      discordUser,
      values,
      token,
      custom_id,
      id,
    );
  }

  public async meetingDetailsTopicCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    return this.interactionsGetMeetingService.meetingDetailsTopicCallback(
      discordUser,
      values,
      token,
      custom_id,
      id,
    );
  }

  public async meetingDetailsDurationCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    return this.interactionsGetMeetingService.meetingDetailsDurationCallback(
      discordUser,
      values,
      token,
      custom_id,
      id,
    );
  }

  async meetingDetailsTimeCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    return this.interactionsGetMeetingService.meetingDetailsTimeCallback(
      discordUser,
      values,
      token,
      custom_id,
      id,
    );
  }

  async addingUserToWhitelist(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    return this.interactionsBotManagingService.addingUserToWhitelist(
      discordUser,
      values,
      token,
      custom_id,
      id,
    );
  }

  async addingUserToWhitelistCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    return this.interactionsBotManagingService.addingUserToWhitelistCallback(
      discordUser,
      values,
      token,
      custom_id,
      id,
    );
  }

  async removingUserFromWhitelist(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    return this.interactionsBotManagingService.removingUserFromWhitelist(
      discordUser,
      values,
      token,
      custom_id,
      id,
    );
  }

  async removingUserFromWhitelistCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    return this.interactionsBotManagingService.removingUserFromWhitelistCallback(
      discordUser,
      values,
      token,
      custom_id,
      id,
    );
  }

  async settingUserConnections(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    return this.interactionsBotManagingService.settingUserConnections(
      discordUser,
      values,
      token,
      custom_id,
      id,
    );
  }

  async connectingUserToMentorCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    return this.interactionsBotManagingService.connectingUserToMentorCallback(
      discordUser,
      values,
      token,
      custom_id,
      id,
    );
  }

  async connectingUserToMentorCallback2(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    return this.interactionsBotManagingService.connectingUserToMentorCallback2(
      discordUser,
      values,
      token,
      custom_id,
      id,
    );
  }

  public async default(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    return this.responseComponentsProvider.generateIntegrationResponse({
      id,
      token,
      type: 4,
      content: 'No action implemented for this command yet.',
    });
  }
}
