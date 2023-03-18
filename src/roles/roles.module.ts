import { Module } from '@nestjs/common';
import { RolesProvider } from './providers/roles.provider';
import { AxiosModule } from 'src/axios/axios.module';
import { RoleDBoperationsProvider } from './providers/role.db-operations.provider';

@Module({
  imports: [AxiosModule],
  providers: [RolesProvider, RoleDBoperationsProvider],
  exports: [RolesProvider],
})
export class RolesModule {}
