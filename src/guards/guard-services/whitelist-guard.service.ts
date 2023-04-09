import { Injectable, ForbiddenException } from '@nestjs/common';
import { WhitelistedGuarsServiceException } from '../exceptions/Whitelisted-guard-service.exception';
import { UsersService } from '../../users/providers/users.service';

@Injectable()
export class WhitelistGuardService {
  constructor(private readonly usersService: UsersService) {}

  async isWhitelisted(id: string): Promise<boolean> {
    try {
      const isWhitelisted: boolean =
        await this.usersService.checIfUserWhitelisted(id);
      if (!isWhitelisted)
        throw new ForbiddenException(
          'User is not on users white list. Let Admin know about this fact.',
        );
      return true;
    } catch (err: any) {
      throw new WhitelistedGuarsServiceException(err.message, {
        causeErr: err,
      });
    }
  }

  async notWhitelisted(): Promise<boolean> {
    try {
      return true;
    } catch (err: any) {
      throw new WhitelistedGuarsServiceException(err.message, {
        causeErr: err,
      });
    }
  }

  async default(): Promise<boolean> {
    try {
      throw new ForbiddenException('No whitelisting guard rule provided');
    } catch (err: any) {
      throw new WhitelistedGuarsServiceException(err.message, {
        causeErr: err,
      });
    }
  }
}
