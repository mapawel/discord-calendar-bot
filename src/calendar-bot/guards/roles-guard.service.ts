import { Injectable, ForbiddenException } from '@nestjs/common';
import { RolesProvider } from 'src/roles/providers/roles.provider';

@Injectable()
export class RolesGuardService {
  constructor(private readonly rolesProvider: RolesProvider) {}
  async checkIfMentor(id: string): Promise<true> {
    const roles: string[] = await this.rolesProvider.getUserRole(id);
    console.log('user roles from guard ----> ', roles);
    // if (1) throw new ForbiddenException(`Roles guard!`);
    return true;
  }
}
