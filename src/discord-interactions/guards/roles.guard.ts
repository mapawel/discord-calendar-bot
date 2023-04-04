import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { MappedInteraction } from '../dto/interaction.dto';
import { RolesGuardService } from './guard-services/roles-guard.service';
import { commands } from '../../app-SETUP/lists/commands.list';
import { allCommandsComponents } from '../components-builder/build-command-components';

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

    const rulesObject =
      type === 2
        ? commands.find((integration) => integration.name === name)
        : type === 3 || type === 5
        ? allCommandsComponents.find((integration) =>
            custom_id?.includes(integration.custom_id),
          )
        : null;

    const rolesAllowedOrAllIfEmpty = rulesObject?.role_guard_rules || [];
    return await this.rolesGuardService.verifyUserRole(
      id,
      rolesAllowedOrAllIfEmpty,
    );
  }
}
