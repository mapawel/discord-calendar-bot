import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { MappedInteraction } from '../dto/interaction.dto';
import { RolesGuardService } from './roles-guard.service';
import { commands } from 'src/discord-commands/app-commands-SETUP/commands.list';
import { commandsComponents } from 'src/discord-commands/app-commands-SETUP/commands-components.list';
import { isItemProperType } from '../utils/ingetrations-utils';
import { AppCommand } from '../../discord-commands/app-commands-SETUP/commands.list';
import { AppCommandComponent } from '../../discord-commands/app-commands-SETUP/commands-components.list';
import { joinAppCommandsWAppCommandsComp } from '../utils/ingetrations-utils';

@Injectable()
export class RolesdGuard implements CanActivate {
  constructor(private readonly rolesGuardService: RolesGuardService) {}
  async canActivate(context: ExecutionContext) {
    const {
      body: {
        discord_usr: { id },
        data: { name, custom_id },
      },
    }: { body: MappedInteraction } = context.switchToHttp().getRequest();

    const allIntegrationsToValidate: (AppCommand | AppCommandComponent)[] =
      joinAppCommandsWAppCommandsComp(commands, commandsComponents);

    const rolesAllowedOrAllIfEmpty =
      allIntegrationsToValidate.find((integration) =>
        isItemProperType<AppCommand, AppCommandComponent>(integration, 'name')
          ? integration.name === name
          : integration.custom_id === custom_id,
      )?.role_guard_rules || [];
    return await this.rolesGuardService.verifyUserRole(
      id,
      rolesAllowedOrAllIfEmpty,
    );
  }
}
