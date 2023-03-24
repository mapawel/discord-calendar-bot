import { Injectable } from '@nestjs/common';
import { userDtoMapper } from '../dto/User-dto.mapper';
import { UserDTO } from '../dto/User.dto';
import { User } from '../entity/User.entity';

// TODO CATCH ERRORS!!!!

@Injectable()
export class UsersRepository {
  public async createUser(id: string, username: string): Promise<true> {
    await User.create({
      id,
      username,
    });
    return true;
  }

  public async updateUserAuthStatus(
    id: string,
    authState: boolean,
  ): Promise<true> {
    await User.update({ authenticated: authState }, { where: { id } });
    return true;
  }

  public async getUserById(id: string): Promise<UserDTO | undefined> {
    const [foundUser] = await User.findAll({
      where: {
        id: id,
      },
    });

    return foundUser ? userDtoMapper(foundUser) : undefined;
  }
}
