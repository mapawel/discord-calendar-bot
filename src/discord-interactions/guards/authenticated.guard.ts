import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { MappedInteraction } from '../dto/interaction.dto';
import { AuthenticatedGuardService } from './authentcated-guard.service';
import { commands } from 'src/discord-commands/app-commands-SETUP/commands.list';
import { commandsComponents } from 'src/discord-commands/app-commands-SETUP/commands-components.list';
import { AppCommandComponent } from 'src/discord-commands/app-commands-SETUP/commands-components.list';
import { AppCommand } from 'src/discord-commands/app-commands-SETUP/commands.list';
import { isItemProperType } from '../utils/ingetrations-utils';
import { joinAppCommandsWAppCommandsComp } from '../utils/ingetrations-utils';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(
    private readonly authenticatedGuardService: AuthenticatedGuardService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const {
      body: {
        discord_usr,
        data: { name, custom_id },
      },
    }: { body: MappedInteraction } = context.switchToHttp().getRequest();

    const allIntegrationsToValidate: (AppCommand | AppCommandComponent)[] =
      joinAppCommandsWAppCommandsComp(commands, commandsComponents);

    const serviceMethod =
      allIntegrationsToValidate.find((integration) =>
        isItemProperType<AppCommand, AppCommandComponent>(integration, 'name')
          ? integration.name === name
          : integration.custom_id === custom_id,
      )?.authenticated_guard_rule || 'default';
    return await this.authenticatedGuardService[serviceMethod](discord_usr);
  }
}
