import { config } from 'dotenv';
import { Injectable } from '@nestjs/common';
import { DiscordUserDTO } from '../dto/Discord-user.dto';
import { IntegrationSlashCommandsService } from './interactions-slash-commands.service';
import { InteractionsGetMeetingService } from './subservices/interactions-get-meeting.service';
import { InteractionsBotManagingService } from './subservices/interactions-bot-managing.service';
import { ResponseComponentsProvider } from './response-components.provider';

config();

@Injectable()
export class IntegrationService {
  constructor(
    private readonly integrationSlashCommandsService: IntegrationSlashCommandsService,
    private readonly interactionsGetMeetingService: InteractionsGetMeetingService,
    private readonly interactionsBotManagingService: InteractionsBotManagingService,
    private readonly responseComponentsProvider: ResponseComponentsProvider,
  ) {}

  async responseWithPong() {
    return this.integrationSlashCommandsService.responseWithPong();
  }

  async managingBot(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    return this.integrationSlashCommandsService.managingBot(
      discordUser,
      values,
      token,
      custom_id,
      id,
    );
  }

  async authenticate(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    return this.integrationSlashCommandsService.authenticate(
      discordUser,
      values,
      token,
      custom_id,
      id,
    );
  }

  async responseForMeetingInit(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    return this.integrationSlashCommandsService.responseForMeetingInit(
      discordUser,
      values,
      token,
      custom_id,
      id,
    );
  }

  async meetingChooseMentorCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    return this.interactionsGetMeetingService.meetingChooseMentorCallback(
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
    components: any[], //TODO to make a type
  ) {
    return this.interactionsBotManagingService.addingUserToWhitelistCallback(
      discordUser,
      values,
      token,
      custom_id,
      id,
      components,
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
    components: any[], //TODO to make a type
  ) {
    return this.interactionsBotManagingService.removingUserFromWhitelistCallback(
      discordUser,
      values,
      token,
      custom_id,
      id,
      components,
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
    components: any[], //TODO to make a type
  ) {
    return this.interactionsBotManagingService.connectingUserToMentorCallback(
      discordUser,
      values,
      token,
      custom_id,
      id,
      components,
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
    return this.responseComponentsProvider.generateInteractionResponse({
      id,
      token,
      type: 4,
      content: 'No action implemented for this command yet.',
    });
  }
}
