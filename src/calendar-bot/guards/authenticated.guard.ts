import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { User } from '../entities/User.entity';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const {
      body: { discord_usr },
    } = context.switchToHttp().getRequest();

    const [foundUser] = await User.findAll({
      where: {
        discordId: discord_usr.id,
      },
    });
    return foundUser?.dataValues?.authenticated ? true : false;
  }
}
