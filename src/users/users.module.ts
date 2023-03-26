import { Module } from '@nestjs/common';
import { UsersService } from './providers/users.service';
import { UsersRepository } from './providers/users.repository';
import { AxiosModule } from 'src/axios/axios.module';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports: [AxiosModule, RolesModule],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
