import { Module } from '@nestjs/common';
import { UserManagementService } from './providers/user-management.service';
import { UserManagementRepository } from './providers/user-management.repository';

@Module({
  providers: [UserManagementService, UserManagementRepository],
  exports: [UserManagementService],
})
export class UserManagementModule {}
