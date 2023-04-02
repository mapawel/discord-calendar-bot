import { Module } from '@nestjs/common';
import { GoogleApiService } from './Google-api.service';
import { DiscordApiService } from './Discord-api.service';
import { AuthzApiService } from './Authz-api.service';

@Module({
  providers: [GoogleApiService, AuthzApiService, DiscordApiService],
  exports: [GoogleApiService, AuthzApiService, DiscordApiService],
})
export class ApisModule {}
