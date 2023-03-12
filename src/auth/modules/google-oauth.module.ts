import { Module } from '@nestjs/common';
import { GoogleOauthController } from '../controllers/google-oauth.controller';
import { GoogleOauthStrategy } from '../strategies/google-oauth.strategy';

@Module({
  imports: [],
  controllers: [GoogleOauthController],
  providers: [GoogleOauthStrategy],
})
export class GoogleOauthModule {}
