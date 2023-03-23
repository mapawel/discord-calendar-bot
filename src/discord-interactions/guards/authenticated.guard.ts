import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { MappedInteraction } from '../dto/interaction.dto';
import { AuthenticatedGuardService } from './authentcated-guard.service';
import { commands } from 'src/app-SETUP/commands.list';
import { commandsComponents } from 'src/app-SETUP/commands-components.list';
import { commandsSelectComponents } from 'src/app-SETUP/commands-select-components.list';
import { AppCommandComponent } from 'src/app-SETUP/commands-components.list';
import { AppCommandSelectComponent } from 'src/app-SETUP/commands-select-components.list';
import { getAllCommandComponentsFromObj } from '../utils/ingetrations-utils';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(
    private readonly authenticatedGuardService: AuthenticatedGuardService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const {
      body: {
        discord_usr,
        type,
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

    const serviceMethod = rulesObject?.authenticated_guard_rule || 'default';

    return await this.authenticatedGuardService[serviceMethod](discord_usr);
  }
}
