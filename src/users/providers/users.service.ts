import { Injectable } from '@nestjs/common';
import { UserDto } from '../dto/user.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  public async createUser(discordId: string, name: string): Promise<true> {
    return this.usersRepository.createUser(discordId, name);
  }

  public async createUserIfNotExisting(
    discordId: string,
    name: string,
  ): Promise<boolean> {
    const foundUser: UserDto | undefined =
      await this.usersRepository.getUserById(discordId);
    if (foundUser) {
      return false;
    }
    return await this.usersRepository.createUser(discordId, name);
  }

  public async updateUserAuthStatus(
    id: string,
    authhStatus: boolean,
  ): Promise<boolean> {
    return await this.usersRepository.updateUserAuthStatus(id, authhStatus);
  }

  public async getUserById(id: string): Promise<UserDto | undefined> {
    return await this.usersRepository.getUserById(id);
  }
}
