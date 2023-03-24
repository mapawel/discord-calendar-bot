import { Injectable, ForbiddenException } from '@nestjs/common';
import { UserWithAuthDTO } from 'src/users/dto/User-with-auth.dto';
import { UserDTO } from 'src/user-management/dto/User.dto';
import { Commands } from '../../app-SETUP/commands.enum';
import { UsersService } from 'src/users/providers/users.service';

@Injectable()
export class AuthenticatedGuardService {
  constructor(private readonly usersService: UsersService) {}

  async isAuthenticated(user: UserDTO): Promise<true> {
    const userWithAuth: UserWithAuthDTO | undefined =
      await this.usersService.getUserById(user.id);
    if (!userWithAuth?.authenticated)
      throw new ForbiddenException(
        `User not authenticated! Proceed authentication starting with discord command: "/${Commands.AUTHENTICATE}"`,
      );
    return true;
  }

  async notAuthenticated(user: UserDTO): Promise<true> {
    const userWithAuth: UserWithAuthDTO | undefined =
      await this.usersService.getUserById(user.id);
    if (userWithAuth?.authenticated)
      throw new ForbiddenException('User already authenticated!');
    return true;
  }

  async default(user: UserDTO): Promise<true> {
    throw new ForbiddenException(
      'There is no suit authorization rule for this command! Contact the bot administrator to solve this issue.',
    );
  }
}
