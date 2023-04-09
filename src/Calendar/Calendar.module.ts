import { Module } from '@nestjs/common';
import { CalendarService } from './services/Calendar.service';
import { ApisModule } from 'src/APIs/APIs.module';

@Module({
  imports: [ApisModule],
  providers: [CalendarService],
  exports: [CalendarService],
})
export class CalendarModule {}
