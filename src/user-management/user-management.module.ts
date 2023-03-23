import { Module } from '@nestjs/common';
import { UserManagementService } from './providers/user-management.service';
import { UserManagementRepository } from './providers/user-management.repository';
import { AxiosModule } from 'src/axios/axios.module';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports: [AxiosModule, RolesModule],
  providers: [UserManagementService, UserManagementRepository],
  exports: [UserManagementService],
})
export class UserManagementModule {}
