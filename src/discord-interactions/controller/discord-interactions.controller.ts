import { Controller, Post, Body, UseGuards, UseFilters } from '@nestjs/common';
import { IntegrationService } from '../service/interactions.service';
import { MappedInteractionDTO } from '../dto/Interaction.dto';
import { AuthenticatedGuard } from '../guards/authenticated.guard';
import { ForbiddenExceptionFilter } from '../exception-filters/forbidden.filter';
import { AppRoutes } from '../../routes/routes.enum';
import { RolesdGuard } from '../guards/roles.guard';
import { WhitelistGuard } from '../guards/whitelist.guard';
import { commands } from '../../app-SETUP/lists/commands.list';
import { allCommandsComponents } from '../../discord-commands/components-operations/discord-component-operations.helper';
import { BadRequestFilter } from '../exception-filters/bad-request.filter';
import { NotFoundFilter } from '../exception-filters/not-found.filter';
import { getInteractionSettingObject } from '../../discord-commands/components-operations/discord-component-operations.helper';
import { RestErrorsFilter } from '../exception-filters/rest-errors.filter';

@Controller()
export class DiscordInteractionController {
  constructor(private readonly interactionService: IntegrationService) {}

  @Post(AppRoutes.DISCORD_INTERACTIONS_METHOD)
  @UseGuards(WhitelistGuard)
  @UseGuards(RolesdGuard)
  @UseGuards(AuthenticatedGuard)
  @UseFilters(ForbiddenExceptionFilter)
  @UseFilters(BadRequestFilter)
  @UseFilters(NotFoundFilter)
  @UseFilters(RestErrorsFilter)
  async interactionsHandler(
    @Body()
    body: MappedInteractionDTO,
  ) {
    const {
      id,
      token,
      type,
      data: { name, custom_id, values, components },
      discord_usr,
      message,
    } = body;

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

    return await this.interactionService[serviceMethod](
      discord_usr,
      values || [],
      token,
      custom_id || '',
      id,
      components || [],
      message,
    );
  }
}
