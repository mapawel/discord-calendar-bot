import { Controller, Post, Body, UseGuards, UseFilters } from '@nestjs/common';
import { DiscordInteractionService } from '../service/discord-interactions.service';
import { MappedInteraction } from '../dto/interaction.dto';
import { AuthenticatedGuard } from '../guards/authenticated.guard';
import { ForbiddenExceptionFilter } from '../exception-filters/forbidden.filter';
import { AppRoutes } from '../../app-routes/app-routes.enum';
import { RolesdGuard } from '../guards/roles.guard';
import { WhitelistGuard } from '../guards/whitelist.guard';
import { commands } from '../../discord-commands/app-commands-SETUP/commands.list';
import { commandsComponents } from '../../discord-commands/app-commands-SETUP/commands-components.list';
import { commandsSelectComponents } from 'src/discord-commands/app-commands-SETUP/commands-select-components.list';
import { AppCommand } from '../../discord-commands/app-commands-SETUP/commands.list';
import { AppCommandSelectComponent } from 'src/discord-commands/app-commands-SETUP/commands-select-components.list';
import { AppCommandComponent } from '../../discord-commands/app-commands-SETUP/commands-components.list';
import { getAllCommandComponentsFromObj } from '../utils/ingetrations-utils';

@Controller()
export class DiscordInteractionController {
  constructor(
    private readonly discordInteractionService: DiscordInteractionService,
  ) {}

  @Post(AppRoutes.DISCORD_INTERACTIONS_METHOD)
  // @UseGuards(WhitelistGuard)
  @UseGuards(RolesdGuard)
  @UseGuards(AuthenticatedGuard)
  @UseFilters(ForbiddenExceptionFilter)
  async interactionsHandler(
    @Body()
    body: MappedInteraction,
  ) {
    const {
      id,
      token,
      type,
      data: { name, custom_id, values },
      discord_usr,
    } = body;

    const allCommandsComponents: (
      | AppCommandComponent
      | AppCommandSelectComponent
    )[] = getAllCommandComponentsFromObj({
      ...commandsComponents,
      ...commandsSelectComponents,
    });

    if (type === 1) return this.discordInteractionService.responseWithPong();

    if (type === 2) {
      const serviceMethod =
        commands.find((integration) => integration.name === name)
          ?.controller_service_method || 'default';

      return await this.discordInteractionService[serviceMethod](
        discord_usr,
        values || [],
      );
    }
    if (type === 3) {
      const serviceMethod =
        allCommandsComponents.find(
          (integration) => integration.custom_id === custom_id,
        )?.controller_service_method || 'default';

      return await this.discordInteractionService[serviceMethod](
        discord_usr,
        values || [],
      );
    }
  }
}
