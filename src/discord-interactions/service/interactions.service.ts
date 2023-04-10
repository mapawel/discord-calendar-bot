import { Injectable } from '@nestjs/common';
import { IntegrationSlashCommandsService } from './subservices/interactions-slash-commands.service';
import { InteractionsGetMeetingService } from './subservices/interactions-get-meeting.service';
import { InteractionsBotManagingService } from './subservices/interactions-bot-managing.service';
import { ResponseComponentsProvider } from './response-components.provider';
import { DiscordInteractionException } from '../exception/Discord-interaction.exception';
import { InteractionResponseType } from 'discord-interactions';
import { InteractionBodyFieldsType } from '../types/Body-fields.type';

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

  public async manageBot(interactionBodyFieldsType: InteractionBodyFieldsType) {
    try {
      return await this.integrationSlashCommandsService.manageBot(
        interactionBodyFieldsType,
      );
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  public async authenticate(
    interactionBodyFieldsType: InteractionBodyFieldsType,
  ) {
    try {
      return await this.integrationSlashCommandsService.authenticate(
        interactionBodyFieldsType,
      );
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  public async getMeetingInit(
    interactionBodyFieldsType: InteractionBodyFieldsType,
  ) {
    try {
      return await this.integrationSlashCommandsService.getMeetingInit(
        interactionBodyFieldsType,
      );
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  public async getMeetingSelectMentor(
    interactionBodyFieldsType: InteractionBodyFieldsType,
  ) {
    try {
      return await this.interactionsGetMeetingService.getMeetingSelectMentor(
        interactionBodyFieldsType,
      );
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  public async getMeetingSelectTopic(
    interactionBodyFieldsType: InteractionBodyFieldsType,
  ) {
    try {
      return await this.interactionsGetMeetingService.getMeetingSelectTopic(
        interactionBodyFieldsType,
      );
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  public async getMeetingSelectDuration(
    interactionBodyFieldsType: InteractionBodyFieldsType,
  ) {
    try {
      return await this.interactionsGetMeetingService.getMeetingSelectDuration(
        interactionBodyFieldsType,
      );
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  public async getMeetingSelectTime(
    interactionBodyFieldsType: InteractionBodyFieldsType,
  ) {
    try {
      return await this.interactionsGetMeetingService.getMeetingSelectTime(
        interactionBodyFieldsType,
      );
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  public async addUserToWhitelist(
    interactionBodyFieldsType: InteractionBodyFieldsType,
  ) {
    try {
      return await this.interactionsBotManagingService.addUserToWhitelist(
        interactionBodyFieldsType,
      );
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  public async addUserToWhitelistCallback(
    interactionBodyFieldsType: InteractionBodyFieldsType,
  ) {
    try {
      return await this.interactionsBotManagingService.addUserToWhitelistCallback(
        interactionBodyFieldsType,
      );
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  public async removeUserFromWhitelist(
    interactionBodyFieldsType: InteractionBodyFieldsType,
  ) {
    try {
      return await this.interactionsBotManagingService.removeUserFromWhitelist(
        interactionBodyFieldsType,
      );
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  public async removeUserFromWhitelistCallback(
    interactionBodyFieldsType: InteractionBodyFieldsType,
  ) {
    try {
      return await this.interactionsBotManagingService.removeUserFromWhitelistCallback(
        interactionBodyFieldsType,
      );
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  public async setUserConnections(
    interactionBodyFieldsType: InteractionBodyFieldsType,
  ) {
    try {
      return await this.interactionsBotManagingService.setUserConnections(
        interactionBodyFieldsType,
      );
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  public async setUserConUserSelected(
    interactionBodyFieldsType: InteractionBodyFieldsType,
  ) {
    try {
      return await this.interactionsBotManagingService.setUserConUserSelected(
        interactionBodyFieldsType,
      );
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  public async setUserConHostSelected(
    interactionBodyFieldsType: InteractionBodyFieldsType,
  ) {
    try {
      return await this.interactionsBotManagingService.setUserConHostSelected(
        interactionBodyFieldsType,
      );
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  public async displayWhitelist(
    interactionBodyFieldsType: InteractionBodyFieldsType,
  ) {
    try {
      return await this.interactionsBotManagingService.displayWhitelist(
        interactionBodyFieldsType,
      );
    } catch (err: any) {
      throw new DiscordInteractionException(err.message, { causeErr: err });
    }
  }

  public async default(interactionBodyFieldsType: InteractionBodyFieldsType) {
    try {
      const { id, token }: InteractionBodyFieldsType =
        interactionBodyFieldsType;

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
