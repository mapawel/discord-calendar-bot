import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { InteractionService } from '../service/interactions.service';
import { MappedInteractionDTO } from '../dto/Interaction.dto';
import { AuthenticatedGuard } from '../../guards/authenticated.guard';
import { AppRoutes } from '../../routes/routes.enum';
import { RolesdGuard } from '../../guards/roles.guard';
import { WhitelistGuard } from '../../guards/whitelist.guard';
import { commands } from '../../app-SETUP/lists/commands.list';
import { allCommandsComponents } from '../components-operations/discord-component-operations.helper';
import { getInteractionSettingObject } from '../components-operations/discord-component-operations.helper';
import { InteractionBodyFieldsType } from '../types/Body-fields.type';

@Controller()
export class DiscordInteractionController {
  constructor(private readonly interactionService: InteractionService) {}

  @Post(AppRoutes.DISCORD_INTERACTIONS_METHOD)
  @UseGuards(WhitelistGuard)
  @UseGuards(RolesdGuard)
  @UseGuards(AuthenticatedGuard)
  async interactionsHandler(
    @Body()
    body: MappedInteractionDTO,
  ) {
    const {
      id,
      token,
      type,
      data: { name, custom_id, values, components },
      discordUser,
      message,
    } = body;

    const interactionBodyFields: InteractionBodyFieldsType = {
      discordUser,
      values: values || [],
      token,
      custom_id: custom_id || '',
      id,
      components: components || [],
      message,
    };

    if (type === 1) return this.interactionService.responseWithPong();

    const interactionSettingObject = getInteractionSettingObject(
      type,
      name,
      custom_id,
      commands,
      allCommandsComponents,
    );

    const serviceMethod =
      interactionSettingObject?.controller_service_method || 'default';

    return await this.interactionService[serviceMethod](interactionBodyFields);
  }
}
