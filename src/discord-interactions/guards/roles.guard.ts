import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { MappedInteraction } from '../dto/interaction.dto';
import { RolesGuardService } from './roles-guard.service';
import { commands } from '../../discord-commands/app-commands-SETUP/commands.list';
import { commandsComponents } from '../../discord-commands/app-commands-SETUP/commands-components.list';
import { commandsSelectComponents } from '../../discord-commands/app-commands-SETUP/commands-select-components.list';
import { AppCommandComponent } from '../../discord-commands/app-commands-SETUP/commands-components.list';
import { AppCommandSelectComponent } from '../../discord-commands/app-commands-SETUP/commands-select-components.list';
import { getAllCommandComponentsFromObj } from '../utils/ingetrations-utils';

@Injectable()
export class RolesdGuard implements CanActivate {
  constructor(private readonly rolesGuardService: RolesGuardService) {}
  async canActivate(context: ExecutionContext) {
    const {
      body: {
        type,
        discord_usr: { id },
        data: { name, custom_id },
      },
    }: { body: MappedInteraction } = context.switchToHttp().getRequest();

    const allCommandsComponents: (
      | AppCommandComponent
      | AppCommandSelectComponent
    )[] = getAllCommandComponentsFromObj({
      ...commandsComponents,
      ...commandsSelectComponents,
    });

    const rulesObject =
      type === 2
        ? commands.find((integration) => integration.name === name)
        : type === 3
        ? allCommandsComponents.find(
            (integration) => integration.custom_id === custom_id,
          )
        : null;

    const rolesAllowedOrAllIfEmpty = rulesObject?.role_guard_rules || [];
    return await this.rolesGuardService.verifyUserRole(
      id,
      rolesAllowedOrAllIfEmpty,
    );
  }
}
