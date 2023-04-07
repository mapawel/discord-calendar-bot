import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { MappedInteractionDTO } from '../dto/Interaction.dto';
import { RolesGuardService } from './guard-services/roles-guard.service';
import { commands } from '../../app-SETUP/lists/commands.list';
import { getInteractionSettingObject } from '../../discord-commands/components-operations/discord-component-operations.helper';
import { allCommandsComponents } from '../../discord-commands/components-operations/discord-component-operations.helper';

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
    }: { body: MappedInteractionDTO } = context.switchToHttp().getRequest();

    const interactionSettingObject = getInteractionSettingObject(
      type,
      name,
      custom_id,
      commands,
      allCommandsComponents,
    );

    const rolesAllowedOrAllIfEmpty =
      interactionSettingObject?.role_guard_rules || [];
    return await this.rolesGuardService.verifyUserRole(
      id,
      rolesAllowedOrAllIfEmpty,
    );
  }
}
