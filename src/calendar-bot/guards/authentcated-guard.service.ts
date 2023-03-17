import { Injectable, ForbiddenException } from '@nestjs/common';
import { UserDto } from '../dto/user.dto';
import { User } from '../entities/User.entity';
import { Commands } from '../discord-commands/commands.enum';

@Injectable()
export class AuthenticatedGuardService {
  async getMeetingCommand(discord_usr: UserDto): Promise<true> {
    const user: User | undefined = await this.getUserFromDB(discord_usr.id);
    if (!user)
      throw new ForbiddenException(
        `User not authenticated! Proceed authentication starting with discord command: "/${Commands.AUTHENTICATE}"`,
      );
    return true;
  }

  async test() {
    return true;
  }

  async autenticationCommand(discord_usr: UserDto): Promise<true> {
    const user: User | undefined = await this.getUserFromDB(discord_usr.id);
    if (user) throw new ForbiddenException('User already authenticated!');
    return true;
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
