import { Injectable } from '@nestjs/common';
import { DiscordUserDTO } from '../dto/Discord-user.dto';
import { IntegrationSlashCommandsService } from './subservices/interactions-slash-commands.service';
import { InteractionsGetMeetingService } from './subservices/interactions-get-meeting.service';
import { InteractionsBotManagingService } from './subservices/interactions-bot-managing.service';
import { ResponseComponentsProvider } from './response-components.provider';
import { InteractionMessageDTO } from '../dto/Interaction-message.dto';
import { InteractionComponentDTO } from '../dto/Interaction-component.dto';
import { DiscordInteractionException } from '../exception/Discord-interaction.exception';

@Injectable()
export class IntegrationService {
  constructor(
    private readonly integrationSlashCommandsService: IntegrationSlashCommandsService,
    private readonly interactionsGetMeetingService: InteractionsGetMeetingService,
    private readonly interactionsBotManagingService: InteractionsBotManagingService,
    private readonly responseComponentsProvider: ResponseComponentsProvider,
  ) {}

  public async responseWithPong() {
    try {
      return await this.integrationSlashCommandsService.responseWithPong();
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  public async managingBot(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    try {
      return await this.integrationSlashCommandsService.managingBot(
        discordUser,
        values,
        token,
        custom_id,
        id,
      );
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  public async authenticate(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    try {
      return await this.integrationSlashCommandsService.authenticate(
        discordUser,
        values,
        token,
        custom_id,
        id,
      );
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  public async responseForMeetingInit(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    try {
      return await this.integrationSlashCommandsService.responseForMeetingInit(
        discordUser,
        values,
        token,
        custom_id,
        id,
      );
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  public async meetingChooseMentorCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    try {
      return await this.interactionsGetMeetingService.meetingChooseMentorCallback(
        discordUser,
        values,
        token,
        custom_id,
        id,
      );
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  public async meetingDetailsTopicCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
    components: InteractionComponentDTO[],
    message: InteractionMessageDTO,
  ) {
    try {
      return await this.interactionsGetMeetingService.meetingDetailsTopicCallback(
        discordUser,
        values,
        token,
        custom_id,
        id,
        components,
        message,
      );
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  public async meetingDetailsDurationCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
    components: InteractionComponentDTO[],
    message: InteractionMessageDTO,
  ) {
    try {
      return await this.interactionsGetMeetingService.meetingDetailsDurationCallback(
        discordUser,
        values,
        token,
        custom_id,
        id,
        components,
        message,
      );
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  public async meetingDetailsTimeCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
    components: InteractionComponentDTO[],
    message: InteractionMessageDTO,
  ) {
    try {
      return await this.interactionsGetMeetingService.meetingDetailsTimeCallback(
        discordUser,
        values,
        token,
        custom_id,
        id,
        components,
        message,
      );
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  public async addingUserToWhitelist(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    try {
      return await this.interactionsBotManagingService.addingUserToWhitelist(
        discordUser,
        values,
        token,
        custom_id,
        id,
      );
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  public async addingUserToWhitelistCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
    components: InteractionComponentDTO[],
  ) {
    try {
      return await this.interactionsBotManagingService.addingUserToWhitelistCallback(
        discordUser,
        values,
        token,
        custom_id,
        id,
        components,
      );
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  public async removingUserFromWhitelist(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    try {
      return await this.interactionsBotManagingService.removingUserFromWhitelist(
        discordUser,
        values,
        token,
        custom_id,
        id,
      );
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  public async removingUserFromWhitelistCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
    components: InteractionComponentDTO[],
  ) {
    try {
      return await this.interactionsBotManagingService.removingUserFromWhitelistCallback(
        discordUser,
        values,
        token,
        custom_id,
        id,
        components,
      );
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  public async settingUserConnections(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    try {
      return await this.interactionsBotManagingService.settingUserConnections(
        discordUser,
        values,
        token,
        custom_id,
        id,
      );
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  public async settingUserConUserSelected(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
    components: InteractionComponentDTO[],
  ) {
    try {
      return await this.interactionsBotManagingService.settingUserConUserSelected(
        discordUser,
        values,
        token,
        custom_id,
        id,
        components,
      );
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  public async settingUserConHostSelected(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
    components: InteractionComponentDTO[],
    message: InteractionMessageDTO,
  ) {
    try {
      return await this.interactionsBotManagingService.settingUserConHostSelected(
        discordUser,
        values,
        token,
        custom_id,
        id,
        components,
        message,
      );
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  public async displayWhitelist(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    try {
      return await this.interactionsBotManagingService.displayWhitelist(
        discordUser,
        values,
        token,
        custom_id,
        id,
      );
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  public async default(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    try {
      return await this.responseComponentsProvider.generateInteractionResponse({
        id,
        token,
        type: 4,
        content: 'No action implemented for await this command yet.',
      });
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }
}
