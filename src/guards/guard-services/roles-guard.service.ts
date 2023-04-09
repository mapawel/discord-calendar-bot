import { Injectable, ForbiddenException } from '@nestjs/common';
import { RolesService } from 'src/roles/providers/roles.service';
import { RolesGuarsServiceException } from '../exceptions/Roles-guard-service.exception';

@Injectable()
export class RolesGuardService {
  constructor(private readonly rolesService: RolesService) {}
  public async verifyUserRole(
    id: string,
    rolesAllowedOrAllIfEmpty: string[],
  ): Promise<true> {
    try {
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
    } catch (err: any) {
      throw new RolesGuarsServiceException(err.message, {
        causeErr: err,
      });
    }
  }
}
