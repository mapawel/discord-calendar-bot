import { Injectable } from '@nestjs/common';
import { UserDTO } from 'src/user-management/dto/User.dto';
import { UserWithAuthDTO } from '../dto/User-with-auth.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  public async createUserIfNotExisting(user: UserDTO): Promise<boolean> {
    const foundUser: UserDTO | undefined =
      await this.usersRepository.getUserById(user.id);
    if (foundUser) {
      return false;
    }
    return await this.usersRepository.createUser(user);
  }

  public async updateUserAuthStatus(
    id: string,
    authhStatus: boolean,
  ): Promise<boolean> {
    return await this.usersRepository.updateUserAuthStatus(id, authhStatus);
  }

  public async getUserById(id: string): Promise<UserWithAuthDTO | undefined> {
    return await this.usersRepository.getUserById(id);
  }
}
