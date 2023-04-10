import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { MappedInteractionDTO } from '../discord-interactions/dto/Interaction.dto';
import { RolesGuardService } from './guard-services/roles-guard.service';
import { commands } from '../app-SETUP/lists/commands.list';
import { getInteractionSettingObject } from '../discord-interactions/components-operations/discord-component-operations.helper';
import { allCommandsComponents } from '../discord-interactions/components-operations/discord-component-operations.helper';
import { RolesGuarsServiceException } from './exceptions/Roles-guard-service.exception';

@Injectable()
export class RolesdGuard implements CanActivate {
  constructor(private readonly rolesGuardService: RolesGuardService) {}
  async canActivate(context: ExecutionContext) {
    try {
      const {
        body: {
          type,
          discordUser: { id },
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
    } catch (err: any) {
      throw new RolesGuarsServiceException(err.message, {
        causeErr: err,
      });
    }
  }
}
