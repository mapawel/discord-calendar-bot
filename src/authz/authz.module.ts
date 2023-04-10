import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthzService } from './service/authz.service';
import { AuthzController } from './controllers/authz.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';
import { ApisModule } from '../APIs/APIs.module';
import { HostCalendarModule } from '../Host-calendar/Host-calendar.module';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  controllers: [AuthzController],
  imports: [
    JwtModule.register({ secret: process.env.JWT_SECRET }),
    UsersModule,
    RolesModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ApisModule,
    HostCalendarModule,
  ],
  providers: [JwtStrategy, AuthzService],
  exports: [PassportModule, AuthzService],
})
export class AuthzModule {}
