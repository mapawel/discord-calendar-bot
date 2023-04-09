import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { MappedInteractionDTO } from '../discord-interactions/dto/Interaction.dto';
import { WhitelistGuardService } from './guard-services/whitelist-guard.service';
import { commands } from '../app-SETUP/lists/commands.list';
import { getInteractionSettingObject } from '../discord-interactions/components-operations/discord-component-operations.helper';
import { allCommandsComponents } from '../discord-interactions/components-operations/discord-component-operations.helper';

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
    }: { body: MappedInteractionDTO } = context.switchToHttp().getRequest();

    const interactionSettingObject = getInteractionSettingObject(
      type,
      name,
      custom_id,
      commands,
      allCommandsComponents,
    );

    const serviceMethod =
      interactionSettingObject?.whitelisting_guard_rule || 'default';

    return await this.whitelistGuardService[serviceMethod](id);
  }
}
