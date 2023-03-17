import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { MappedInteraction } from '../dto/interaction.dto';
import { Commands } from '../../discord-commands/commands.enum';
import { AuthenticatedGuardService } from './authentcated-guard.service';

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

    if (name === Commands.AUTHENTICATE)
      return await this.authenticatedGuardService.autenticationCommand(
        discord_usr,
      );
    if (name === Commands.GET_MEETING)
      return await this.authenticatedGuardService.getMeetingCommand(
        discord_usr,
      );

    return false;
  }
}
// TODO to split this into two guards
