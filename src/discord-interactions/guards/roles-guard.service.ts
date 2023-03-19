import { Injectable, ForbiddenException } from '@nestjs/common';
import { RolesService } from 'src/roles/providers/roles.service';

@Injectable()
export class RolesGuardService {
  constructor(private readonly rolesService: RolesService) {}
  async verifyUserRole(
    id: string,
    rolesAllowedOrAllIfEmpty: string[],
  ): Promise<true> {
    const userRoles: string[] = await this.rolesService.getUserRole(id);

    if (rolesAllowedOrAllIfEmpty.length === 0) return true;

    const rolesAllowedIds = await this.rolesService.translateRoleNamesToIds(
      rolesAllowedOrAllIfEmpty,
    );

    const userHasAllowedRole = userRoles.some((role) =>
      rolesAllowedIds.includes(role),
    );
    if (!userHasAllowedRole)
      throw new ForbiddenException('Not authorized to use this command!');
    return true;
  }
}
