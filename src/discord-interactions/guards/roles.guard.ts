import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { MappedInteraction } from '../dto/interaction.dto';
import { RolesGuardService } from './roles-guard.service';
import { commands } from 'src/discord-commands/app-commands-SETUP/commands.list';

@Injectable()
export class RolesdGuard implements CanActivate {
  constructor(private readonly rolesGuardService: RolesGuardService) {}
  async canActivate(context: ExecutionContext) {
    const {
      body: {
        discord_usr: { id },
        data: { name },
      },
    }: { body: MappedInteraction } = context.switchToHttp().getRequest();

    const rolesAllowedOrAllIfEmpty =
      commands.find((command) => command.name === name)?.role_guard_rules || [];
    return await this.rolesGuardService.verifyUserRole(
      id,
      rolesAllowedOrAllIfEmpty,
    );
  }
}
