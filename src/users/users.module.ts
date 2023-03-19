import { Module } from '@nestjs/common';
import { UsersService } from './providers/users.service';
import { UsersRepository } from './providers/users.repository';

@Module({
  imports: [],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
