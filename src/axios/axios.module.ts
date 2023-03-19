import { Module } from '@nestjs/common';
import { AxiosProvider } from './provider/axios.provider';

@Module({
  providers: [AxiosProvider],
  exports: [AxiosProvider],
})
export class AxiosModule {}
