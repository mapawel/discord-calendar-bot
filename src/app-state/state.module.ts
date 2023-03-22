import { Module } from '@nestjs/common';
import { StateService } from './state.service';
import { StateFileRepository } from './state.file-repository';
@Module({
  providers: [StateService, StateFileRepository],
  exports: [StateService],
})
export class StateModule {}
