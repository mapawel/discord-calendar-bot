import { Module } from '@nestjs/common';
import { RolesService } from './providers/roles.service';
import { AxiosModule } from 'src/axios/axios.module';
import { RolesRepository } from './providers/roles.repository';

@Module({
  imports: [AxiosModule],
  providers: [RolesService, RolesRepository],
  exports: [RolesService],
})
export class RolesModule {}
