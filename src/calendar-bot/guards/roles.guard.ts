import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { MappedInteraction } from '../dto/interaction.dto';
import { RolesGuardService } from './roles-guard.service';

@Injectable()
export class RolesdGuard implements CanActivate {
  constructor(private readonly rolesGuardService: RolesGuardService) {}
  async canActivate(context: ExecutionContext) {
    const {
      body: {
        discord_usr: { id },
      },
    }: { body: MappedInteraction } = context.switchToHttp().getRequest();

    if (1) return await this.rolesGuardService.checkIfMentor(id);

    return false;
  }
}
// TODO to split this into two guards
