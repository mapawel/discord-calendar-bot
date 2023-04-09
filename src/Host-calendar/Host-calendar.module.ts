import { Module } from '@nestjs/common';
import { HostCalendarService } from './services/Host-calendar.service';
import { ApisModule } from 'src/APIs/APIs.module';

@Module({
  imports: [ApisModule],
  providers: [HostCalendarService],
  exports: [HostCalendarService],
})
export class HostCalendarModule {}
