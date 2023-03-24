import { Injectable } from '@nestjs/common';
import { UserWithAuthMapper } from '../dto/User-with-auth-dto.mapper';
import { UserDTO } from 'src/user-management/dto/User.dto';
import { UserWithAuthDTO } from '../dto/User-with-auth.dto';
import { UserWithAuth } from '../entity/User-with-auth.entity';
import { DBException } from 'src/db/exception/DB.exception';

@Injectable()
export class UsersRepository {
  public async createUser(user: UserDTO): Promise<true> {
    try {
      await UserWithAuth.create({
        id: user.id,
        username: user.username,
      });
      return true;
    } catch (err: any) {
      throw new DBException(err?.message);
    }
  }

  public async updateUserAuthStatus(
    id: string,
    authState: boolean,
  ): Promise<true> {
    try {
      await UserWithAuth.update(
        { authenticated: authState },
        { where: { id } },
      );
      return true;
    } catch (err: any) {
      throw new DBException(err?.message);
    }
  }

  public async getUserById(id: string): Promise<UserWithAuthDTO | undefined> {
    try {
      const foundUser: UserWithAuth | null = await UserWithAuth.findByPk(id);
      return foundUser ? UserWithAuthMapper(foundUser) : undefined;
    } catch (err: any) {
      throw new DBException(err?.message);
    }
  }
}
