import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { MappedInteraction } from '../dto/interaction.dto';
import { AuthenticatedGuardService } from './authentcated-guard.service';
import { commands } from 'src/discord-commands/commands.list';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(
    private readonly authenticatedGuardService: AuthenticatedGuardService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const {
      body: {
        discord_usr,
        data: { name },
      },
    }: { body: MappedInteraction } = context.switchToHttp().getRequest();

    const serviceMethod =
      commands.find((command) => command.name === name)
        ?.authenticated_guard_rule || 'default';
    return await this.authenticatedGuardService[serviceMethod](discord_usr);
  }
}
// TODO to split this into two guards
