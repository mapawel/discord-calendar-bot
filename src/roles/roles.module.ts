import { Module } from '@nestjs/common';
import { RolesService } from './providers/roles.service';
import { ApisModule } from '../APIs/APIs.module';
import { RolesRepository } from './providers/roles.repository';

@Module({
  imports: [ApisModule],
  providers: [RolesService, RolesRepository],
  exports: [RolesService],
})
export class RolesModule {}
