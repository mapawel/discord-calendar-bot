import { Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class WhitelistGuardService {
  // constructor(private readonly rolesService: RolesService) {}
  async isUserOnWhiteList(id: string): Promise<boolean> {
    return false;
  }
}
