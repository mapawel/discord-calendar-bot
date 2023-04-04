import { Controller, Post, Body, UseGuards, UseFilters } from '@nestjs/common';
import { IntegrationSlashCommandsService } from '../service/interactions-slash-commands.service';
import { IntegrationComponentsService } from '../service/interactions-components.service';
import { MappedInteraction } from '../dto/interaction.dto';
import { AuthenticatedGuard } from '../guards/authenticated.guard';
import { ForbiddenExceptionFilter } from '../exception-filters/forbidden.filter';
import { AppRoutes } from '../../routes/routes.enum';
import { RolesdGuard } from '../guards/roles.guard';
import { WhitelistGuard } from '../guards/whitelist.guard';
import { commands } from '../../app-SETUP/lists/commands.list';
import { allCommandsComponents } from '../../discord-commands/components-operations/discord-component-operations.helper';
import { BadRequestFilter } from '../exception-filters/bad-request.filter';
import { NotFoundFilter } from '../exception-filters/not-found.filter';

@Controller()
export class DiscordInteractionController {
  constructor(
    private readonly integrationSlashCommandsService: IntegrationSlashCommandsService,
    private readonly integrationComponentsService: IntegrationComponentsService,
  ) {}

  @Post(AppRoutes.DISCORD_INTERACTIONS_METHOD)
  @UseGuards(WhitelistGuard)
  @UseGuards(RolesdGuard)
  @UseGuards(AuthenticatedGuard)
  @UseFilters(ForbiddenExceptionFilter)
  @UseFilters(BadRequestFilter)
  @UseFilters(NotFoundFilter)
  async interactionsHandler(
    @Body()
    body: MappedInteraction,
  ) {
    const {
      id,
      token,
      type,
      data: { name, custom_id, values, components },
      discord_usr,
    } = body;

    if (type === 1)
      return this.integrationSlashCommandsService.responseWithPong();

    if (type === 2) {
      const serviceMethod =
        commands.find((integration) => integration.name === name)
          ?.controller_service_method || 'default';

      return await this.integrationSlashCommandsService[serviceMethod](
        discord_usr,
        values || [],
        token,
        custom_id || '',
        id,
      );
    }

    if (type === 3 || type === 5) {
      const serviceMethod =
        allCommandsComponents.find((integration) =>
          custom_id?.includes(integration.custom_id),
        )?.controller_service_method || 'default';

      return await this.integrationComponentsService[serviceMethod](
        discord_usr,
        values || [],
        token,
        custom_id || '',
        id,
        components || [],
      );
    }
  }
}
