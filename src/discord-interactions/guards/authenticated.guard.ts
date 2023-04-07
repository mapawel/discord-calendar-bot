import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { MappedInteractionDTO } from '../dto/Interaction.dto';
import { AuthenticatedGuardService } from './guard-services/authentcated-guard.service';
import { commands } from '../../app-SETUP/lists/commands.list';
import { getInteractionSettingObject } from '../../discord-commands/components-operations/discord-component-operations.helper';
import { allCommandsComponents } from '../../discord-commands/components-operations/discord-component-operations.helper';

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
    }: { body: MappedInteractionDTO } = context.switchToHttp().getRequest();

    const interactionSettingObject = getInteractionSettingObject(
      type,
      name,
      custom_id,
      commands,
      allCommandsComponents,
    );

    const serviceMethod =
      interactionSettingObject?.authenticated_guard_rule || 'default';

    return await this.authenticatedGuardService[serviceMethod](discord_usr);
  }
}
