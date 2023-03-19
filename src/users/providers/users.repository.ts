import { Injectable } from '@nestjs/common';
import { userDtoMapper } from '../dto/user-dto.mapper';
import { UserDto } from '../dto/user.dto';
import { User } from '../entity/User.entity';

@Injectable()
export class UsersRepository {
  public async createUser(discordId: string, name: string): Promise<true> {
    await User.create({
      discordId,
      name,
    });
    return true;
  }

  public async updateUserAuthStatus(
    id: string,
    authState: boolean,
  ): Promise<true> {
    await User.update(
      { authenticated: authState },
      { where: { discordId: id } },
    );
    return true;
  }

  public async getUserById(id: string): Promise<UserDto | undefined> {
    const [foundUser] = await User.findAll({
      where: {
        discordId: id,
      },
    });

    return foundUser ? userDtoMapper(foundUser) : undefined;
  }
}
