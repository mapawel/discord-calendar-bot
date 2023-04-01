import { Injectable, ForbiddenException } from '@nestjs/common';
import { UsersService } from 'src/users/providers/users.service';

@Injectable()
export class WhitelistGuardService {
  constructor(private readonly usersService: UsersService) {}

  async isWhitelisted(id: string): Promise<boolean> {
    const isWhitelisted: boolean =
      await this.usersService.checIfUserWhitelisted(id);
    if (!isWhitelisted)
      throw new ForbiddenException(
        'User is not on users white list. Let Admin know about this fact.',
      );
    return true;
  }

  async notWhitelisted(): Promise<boolean> {
    return true;
  }

  async default(): Promise<boolean> {
    throw new ForbiddenException('No whitelisting guard rule provided');
  }
}
