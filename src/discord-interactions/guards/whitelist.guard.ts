import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { MappedInteraction } from '../dto/interaction.dto';
import { WhitelistGuardService } from './whitelist-guard.service';
import { commands } from '../../app-SETUP/commands.list';
import { commandsComponents } from '../../app-SETUP/commands-components.list';
import { commandsSelectComponents } from '../../app-SETUP/commands-select-components.list';
import { AppCommandComponent } from '../../app-SETUP/commands-components.list';
import { AppCommandSelectComponent } from '../../app-SETUP/commands-select-components.list';
import { getAllCommandComponentsFromObj } from '../utils/ingetrations-utils';

@Injectable()
export class WhitelistGuard implements CanActivate {
  constructor(private readonly whitelistGuardService: WhitelistGuardService) {}
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

    const serviceMethod = rulesObject?.whitelisting_guard_rule || 'default';

    return await this.whitelistGuardService[serviceMethod](id);
  }
}
