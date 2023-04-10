import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { MappedInteractionDTO } from '../discord-interactions/dto/Interaction.dto';
import { AuthenticatedGuardService } from './guard-services/authentcated-guard.service';
import { commands } from '../app-SETUP/lists/commands.list';
import { getInteractionSettingObject } from '../discord-interactions/components-operations/discord-component-operations.helper';
import { allCommandsComponents } from '../discord-interactions/components-operations/discord-component-operations.helper';
import { AuthenticatedGuarsServiceException } from './exceptions/Authenticated-guard-service.exception';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(
    private readonly authenticatedGuardService: AuthenticatedGuardService,
  ) {}
  async canActivate(context: ExecutionContext) {
    try {
      const {
        body: {
          discordUser,
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

      return await this.authenticatedGuardService[serviceMethod](discordUser);
    } catch (err: any) {
      throw new AuthenticatedGuarsServiceException(err.message, {
        causeErr: err,
      });
    }
  }
}
