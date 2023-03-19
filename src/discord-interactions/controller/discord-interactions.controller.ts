import { Controller, Post, Body, UseGuards, UseFilters } from '@nestjs/common';
import { DiscordInteractionService } from '../service/discord-interactions.service';
import { MappedInteraction } from '../dto/interaction.dto';
import { AuthenticatedGuard } from '../guards/authenticated.guard';
import { ForbiddenExceptionFilter } from '../exception-filters/forbidden.filter';
import { AppRoutes } from 'src/routes/app-routes.enum';
import { RolesdGuard } from '../guards/roles.guard';
import { commands } from 'src/discord-commands/commands.list';

@Controller()
export class DiscordInteractionController {
  constructor(
    private readonly discordInteractionService: DiscordInteractionService,
  ) {}

  @Post(AppRoutes.DISCORD_INTERACTIONS_METHOD)
  @UseGuards(RolesdGuard)
  @UseGuards(AuthenticatedGuard)
  @UseFilters(ForbiddenExceptionFilter)
  async interactionsHandler(
    @Body()
    body: MappedInteraction,
  ) {
    const {
      type,
      data: { name },
      discord_usr,
    } = body;

    if (type === 1) return this.discordInteractionService.responseWithPong();
    if (type === 2) {
      const serviceMethod =
        commands.find(({ name: n }) => n === name)?.controller_service_method ||
        'default';
      return await this.discordInteractionService[serviceMethod](discord_usr);
    }
  }
}
