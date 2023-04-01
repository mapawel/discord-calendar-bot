import { Module } from '@nestjs/common';
import { StateService } from './State.service';
import { StateFileRepository } from './State-file.repository';
@Module({
  providers: [StateService, StateFileRepository],
  exports: [StateService],
})
export class StateModule {}
