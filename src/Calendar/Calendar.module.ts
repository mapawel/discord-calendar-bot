import { Module } from '@nestjs/common';
import { CalendarService } from './Calendar.service';
import { AuthzModule } from 'src/authz/authz.module';
import { AxiosModule } from 'src/axios/axios.module';

@Module({
  imports: [AuthzModule, AxiosModule],
  providers: [CalendarService],
  exports: [CalendarService],
})
export class CalendarModule {}
