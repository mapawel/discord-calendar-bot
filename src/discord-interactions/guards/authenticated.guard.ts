import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { MappedInteraction } from '../dto/interaction.dto';
import { AuthenticatedGuardService } from './guard-services/authentcated-guard.service';
import { commands } from '../../app-SETUP/lists/commands.list';
import { allCommandsComponents } from '../components-builder/build-command-components';

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

    const rulesObject =
      type === 2
        ? commands.find((integration) => integration.name === name)
        : type === 3 || type === 5
        ? allCommandsComponents.find((integration) =>
            custom_id?.includes(integration.custom_id),
          )
        : null;

    const serviceMethod = rulesObject?.authenticated_guard_rule || 'default';

    return await this.authenticatedGuardService[serviceMethod](discord_usr);
  }
}
