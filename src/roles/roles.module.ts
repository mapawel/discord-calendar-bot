import { Module } from '@nestjs/common';
import { RolesProvider } from './roles.provider';
import { AxiosModule } from 'src/axios/axios.module';

@Module({
  imports: [AxiosModule],
  providers: [RolesProvider],
  exports: [RolesProvider],
})
export class RolesModule {}
