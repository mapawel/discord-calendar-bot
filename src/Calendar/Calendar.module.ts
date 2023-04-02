import { Module } from '@nestjs/common';
import { CalendarService } from './Calendar.service';
import { AuthzModule } from 'src/authz/authz.module';
import { AxiosModule } from 'src/axios/axios.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [AuthzModule, AxiosModule, UsersModule],
  providers: [CalendarService],
  exports: [CalendarService],
})
export class CalendarModule {}
