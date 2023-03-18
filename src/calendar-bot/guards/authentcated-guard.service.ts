import { Injectable, ForbiddenException } from '@nestjs/common';
import { UserDto } from '../dto/user.dto';
import { User } from '../entities/User.entity';
import { Commands } from '../../discord-commands/commands.enum';

@Injectable()
export class AuthenticatedGuardService {
  async isAuthenticated(discord_usr: UserDto): Promise<true> {
    const user: User | undefined = await this.getUserFromDB(discord_usr.id);
    if (!user)
      throw new ForbiddenException(
        `User not authenticated! Proceed authentication starting with discord command: "/${Commands.AUTHENTICATE}"`,
      );
    return true;
  }

  async notAuthenticated(discord_usr: UserDto): Promise<true> {
    const user: User | undefined = await this.getUserFromDB(discord_usr.id);
    if (user) throw new ForbiddenException('User already authenticated!');
    return true;
  }

  async default(discord_usr: UserDto): Promise<true> {
    throw new ForbiddenException(
      'There is no suit authorization rule for this command! Contact the bot administrator to solve this issue.',
    );
  }

  private async getUserFromDB(id: string): Promise<User | undefined> {
    const [foundUser] = await User.findAll({
      where: {
        discordId: id,
      },
    });

    return foundUser;
  }
}
