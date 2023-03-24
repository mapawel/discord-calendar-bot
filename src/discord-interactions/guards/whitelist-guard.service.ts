import { Injectable, ForbiddenException } from '@nestjs/common';
import { UserManagementService } from 'src/user-management/providers/user-management.service';

@Injectable()
export class WhitelistGuardService {
  constructor(private readonly userManagementService: UserManagementService) {}

  async isWhitelisted(id: string): Promise<boolean> {
    const isUser: boolean =
      await this.userManagementService.checkWhitelistedById(id);
    if (!isUser)
      throw new ForbiddenException(
        'User is not on users white list. Let Admin know about this fact.',
      );
    return true;
  }

  async notWhitelisted(id: string): Promise<boolean> {
    return true;
  }

  async default(id: string): Promise<boolean> {
    throw new ForbiddenException('No whitelisting guard rule provided');
  }
}
