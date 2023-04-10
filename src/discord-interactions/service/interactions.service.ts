import { Injectable } from '@nestjs/common';
import { DiscordUserDTO } from '../dto/Discord-user.dto';
import { IntegrationSlashCommandsService } from './subservices/interactions-slash-commands.service';
import { InteractionsGetMeetingService } from './subservices/interactions-get-meeting.service';
import { InteractionsBotManagingService } from './subservices/interactions-bot-managing.service';
import { ResponseComponentsProvider } from './response-components.provider';
import { InteractionMessageDTO } from '../dto/Interaction-message.dto';
import { InteractionComponentDTO } from '../dto/Interaction-component.dto';
import { DiscordInteractionException } from '../exception/Discord-interaction.exception';
import { InteractionResponseType } from 'discord-interactions';

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

  public async manageBot(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    try {
      return await this.integrationSlashCommandsService.manageBot(
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

  public async getMeetingInit(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    try {
      return await this.integrationSlashCommandsService.getMeetingInit(
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

  public async getMeetingSelectMentor(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    try {
      return await this.interactionsGetMeetingService.getMeetingSelectMentor(
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

  public async getMeetingSelectTopic(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
    components: InteractionComponentDTO[],
    message: InteractionMessageDTO,
  ) {
    try {
      return await this.interactionsGetMeetingService.getMeetingSelectTopic(
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

  public async getMeetingSelectDuration(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
    components: InteractionComponentDTO[],
    message: InteractionMessageDTO,
  ) {
    try {
      return await this.interactionsGetMeetingService.getMeetingSelectDuration(
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

  public async getMeetingSelectTime(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
    components: InteractionComponentDTO[],
    message: InteractionMessageDTO,
  ) {
    try {
      return await this.interactionsGetMeetingService.getMeetingSelectTime(
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

  public async addUserToWhitelist(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    try {
      return await this.interactionsBotManagingService.addUserToWhitelist(
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

  public async addUserToWhitelistCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
    components: InteractionComponentDTO[],
  ) {
    try {
      return await this.interactionsBotManagingService.addUserToWhitelistCallback(
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

  public async removeUserFromWhitelist(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    try {
      return await this.interactionsBotManagingService.removeUserFromWhitelist(
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

  public async removeUserFromWhitelistCallback(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
    components: InteractionComponentDTO[],
  ) {
    try {
      return await this.interactionsBotManagingService.removeUserFromWhitelistCallback(
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

  public async setUserConnections(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
  ) {
    try {
      return await this.interactionsBotManagingService.setUserConnections(
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

  public async setUserConUserSelected(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
    components: InteractionComponentDTO[],
  ) {
    try {
      return await this.interactionsBotManagingService.setUserConUserSelected(
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

  public async setUserConHostSelected(
    discordUser: DiscordUserDTO,
    values: string[],
    token: string,
    custom_id: string,
    id: string,
    components: InteractionComponentDTO[],
    message: InteractionMessageDTO,
  ) {
    try {
      return await this.interactionsBotManagingService.setUserConHostSelected(
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
      await this.responseComponentsProvider.generateInteractionResponse({
        id,
        token,
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        content: 'No action implemented for await this command yet.',
      });
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }
}
