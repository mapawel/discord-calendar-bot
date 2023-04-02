import { Module } from '@nestjs/common';
import { UsersService } from './providers/users.service';
import { UsersRepository } from './providers/users.repository';
import { ApisModule } from 'src/APIs/APIs.module';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports: [ApisModule, RolesModule],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
