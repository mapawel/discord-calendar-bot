import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthzService } from './service/authz.service';
import { AuthzController } from './controllers/authz.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [AuthzController],
  imports: [
    JwtModule.register({ secret: process.env.JWT_SECRET }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [JwtStrategy, AuthzService],
  exports: [PassportModule],
})
export class AuthzModule {}
