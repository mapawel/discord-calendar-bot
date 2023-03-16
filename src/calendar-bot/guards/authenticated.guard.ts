import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { User } from '../entities/User.entity';
import { MappedInteraction } from '../dto/interaction.dto';
import { Commands } from '../discord-commands/commands.enum';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const {
      body: {
        discord_usr,
        data: { name },
      },
    }: { body: MappedInteraction } = context.switchToHttp().getRequest();

    if (name === Commands.AUTHENTICATE) return true;

    const [foundUser] = await User.findAll({
      where: {
        discordId: discord_usr.id,
      },
    });
    return foundUser?.dataValues?.authenticated ? true : false;
  }
}
// TODO to split this into two guards
