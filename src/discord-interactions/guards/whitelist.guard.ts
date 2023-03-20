import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { MappedInteraction } from '../dto/interaction.dto';
import { WhitelistGuardService } from './whitelist-guard.service';

@Injectable()
export class WhitelistGuard implements CanActivate {
  constructor(private readonly whitelistGuardService: WhitelistGuardService) {}
  async canActivate(context: ExecutionContext) {
    const {
      body: {
        discord_usr: { id },
        data: { name },
      },
    }: { body: MappedInteraction } = context.switchToHttp().getRequest();

    return this.whitelistGuardService.isUserOnWhiteList(id)
  }
}
