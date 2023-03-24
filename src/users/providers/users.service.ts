import { Injectable } from '@nestjs/common';
import { UserDTO } from '../dto/User.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  public async createUser(id: string, name: string): Promise<true> {
    return this.usersRepository.createUser(id, name);
  }

  public async createUserIfNotExisting(
    id: string,
    name: string,
  ): Promise<boolean> {
    const foundUser: UserDTO | undefined =
      await this.usersRepository.getUserById(id);
    if (foundUser) {
      return false;
    }
    return await this.usersRepository.createUser(id, name);
  }

  public async updateUserAuthStatus(
    id: string,
    authhStatus: boolean,
  ): Promise<boolean> {
    return await this.usersRepository.updateUserAuthStatus(id, authhStatus);
  }

  public async getUserById(id: string): Promise<UserDTO | undefined> {
    return await this.usersRepository.getUserById(id);
  }
}
