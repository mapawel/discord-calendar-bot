import { Injectable, ForbiddenException } from '@nestjs/common';
import { RolesProvider } from 'src/roles/providers/roles.provider';

@Injectable()
export class RolesGuardService {
  constructor(private readonly rolesProvider: RolesProvider) {}
  async verifyUserRole(
    id: string,
    rolesAllowedOrAllIfEmpty: string[],
  ): Promise<true> {
    const userRoles: string[] = await this.rolesProvider.getUserRole(id);

    if (rolesAllowedOrAllIfEmpty.length === 0) return true;

    const rolesAllowedIds = await this.rolesProvider.translateRoleNamesToIds(
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
