import { Injectable, ForbiddenException } from '@nestjs/common';
import { AppUserDTO } from 'src/users/dto/App-user.dto';
import { DiscordUserDTO } from '../dto/Discord-user.dto';
import { Commands } from '../../app-SETUP/commands.enum';
import { UsersService } from 'src/users/providers/users.service';

@Injectable()
export class AuthenticatedGuardService {
  constructor(private readonly usersService: UsersService) {}

  async isAuthenticated(discordUser: DiscordUserDTO): Promise<true> {
    const appUser: AppUserDTO | undefined =
      await this.usersService.getUserByDId(discordUser.id);
    if (!appUser?.authenticated)
      throw new ForbiddenException(
        `User not authenticated! Proceed authentication starting with discord command: "/${Commands.AUTHENTICATE}"`,
      );
    return true;
  }

  async notAuthenticated(discordUser: DiscordUserDTO): Promise<true> {
    const appUser: AppUserDTO | undefined =
      await this.usersService.getUserByDId(discordUser.id);
    if (appUser?.authenticated)
      throw new ForbiddenException('User already authenticated!');
    return true;
  }

  async default(discordUser: DiscordUserDTO): Promise<true> {
    throw new ForbiddenException(
      'There is no suit authorization rule for this command! Contact the bot administrator to solve this issue.',
    );
  }
}
