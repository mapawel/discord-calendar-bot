import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { MappedInteraction } from '../dto/interaction.dto';
import { WhitelistGuardService } from './guard-services/whitelist-guard.service';
import { commands } from '../../app-SETUP/lists/commands.list';
import { getObjectWithRules } from '../../discord-commands/components-operations/discord-component-operations.helper';
import { allCommandsComponents } from '../../discord-commands/components-operations/discord-component-operations.helper';

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

    const rulesObject = getObjectWithRules(
      type,
      name,
      custom_id,
      commands,
      allCommandsComponents,
    );

    const serviceMethod = rulesObject?.whitelisting_guard_rule || 'default';

    return await this.whitelistGuardService[serviceMethod](id);
  }
}
