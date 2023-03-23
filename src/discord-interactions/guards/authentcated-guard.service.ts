import { Injectable, ForbiddenException } from '@nestjs/common';
import { UserDto } from '../../users/dto/user.dto';
import { Commands } from '../../app-SETUP/commands.enum';
import { UsersService } from 'src/users/providers/users.service';

@Injectable()
export class AuthenticatedGuardService {
  constructor(private readonly usersService: UsersService) {}

  async isAuthenticated(discord_usr: UserDto): Promise<true> {
    const user: UserDto | undefined = await this.usersService.getUserById(
      discord_usr.id,
    );
    if (!user?.authenticated)
      throw new ForbiddenException(
        `User not authenticated! Proceed authentication starting with discord command: "/${Commands.AUTHENTICATE}"`,
      );
    return true;
  }

  async notAuthenticated(discord_usr: UserDto): Promise<true> {
    const user: UserDto | undefined = await this.usersService.getUserById(
      discord_usr.id,
    );
    if (user?.authenticated)
      throw new ForbiddenException('User already authenticated!');
    return true;
  }

  async default(discord_usr: UserDto): Promise<true> {
    throw new ForbiddenException(
      'There is no suit authorization rule for this command! Contact the bot administrator to solve this issue.',
    );
  }
}
