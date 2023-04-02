import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import { AppRoutes } from '../../routes/routes.enum';
import { AuthzRoutes } from '../../routes/routes.enum';
import { AuthServiceException } from './exceptions/auth-service.exception';
import { JwtService } from '@nestjs/jwt';
import { JsonWebTokenError } from 'jsonwebtoken';
import { UsersService } from '../../users/providers/users.service';
import { AppUserDTO } from '../../users/dto/App-user.dto';
import { RolesService } from '../../roles/providers/roles.service';
import { AuthzUserDTO } from '../../discord-interactions/dto/Auth-user.dto';
import { AuthzApiService } from 'src/APIs/Authz-api.service';
import { Calendar as CalendarEntity } from 'src/Calendar/entity/Calendar.entity';
import { CalendarService } from 'src/Calendar/Calendar.service';

config();

@Injectable()
export class AuthzService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly authzApiService: AuthzApiService,
    private readonly calendarService: CalendarService,
  ) {}

  public async buildRedirectLink(id: string): Promise<string> {
    const isUserMeetingHost: boolean =
      await this.rolesService.checkIfUserIsMeetingHost(id);
    const signedId = await this.jwtService.signAsync({
      id,
      isHost: isUserMeetingHost,
    });

    const querystring: URLSearchParams = new URLSearchParams({
      audience: `${process.env.AUTH0_AUDIENCE}`,
      connection: isUserMeetingHost ? 'google-oauth2' : '',
      response_type: 'code',
      client_id: `${process.env.AUTHZ_CLIENT_ID}`,
      state: signedId,
      redirect_uri: `${process.env.APP_BASE_URL}${AppRoutes.LOGIN_CONTROLLER}${AppRoutes.LOGIN_CALLBACK_METHOD}`,
      scope: 'openid profile email',
      // connection_scope: 'https://www.googleapis.com/auth/calendar',
      access_type: 'offline',
      approval_prompt: 'force',
      // prompt: 'consent'
    });

    return `${process.env.AUTHZ_API_URL}${AuthzRoutes.AUTHZ_AUTHORIZE}?${querystring}`;
  }

  public async getToken(code: string, state: string) {
    try {
      const { id, isHost } = await this.jwtService.verifyAsync(state);
      const { data } = await this.authzApiService.axiosInstance({
        method: 'POST',
        url: `${AuthzRoutes.AUTHZ_TOKEN}`,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
          grant_type: 'authorization_code',
          client_id: process.env.AUTHZ_CLIENT_ID,
          client_secret: process.env.AUTHZ_SECRET,
          code,
          redirect_uri: `${process.env.APP_BASE_URL}${AppRoutes.LOGIN_CONTROLLER}${AppRoutes.LOGIN_CALLBACK_METHOD}`,
        },
      });

      const { data: authUserData }: { data: AuthzUserDTO } =
        await this.authzApiService.axiosInstance({
          method: 'POST',
          url: `${AuthzRoutes.GET_USET_INFO}`,
          headers: {
            Authorization: `Bearer ${data.access_token}`,
          },
        });

      const verifiedUser: AppUserDTO | undefined =
        await this.usersService.getUserByDId(id);
      if (!verifiedUser)
        throw new AuthServiceException('User not found, could not login!');

      const fullAppUser: AppUserDTO = this.usersService.getFullAppUser(
        verifiedUser,
        authUserData,
      );

      await this.usersService.updateUser(fullAppUser);

      if (isHost) this.handleHostLogin(id, fullAppUser.aId);
    } catch (err: any) {
      if (err instanceof JsonWebTokenError)
        throw new AuthServiceException(
          `Error while verifing a json webtoken from state! ${err.message}`,
        );
      throw new AuthServiceException(
        `Error while getting a token: ${err.message}`,
      );
    }
  }

  private async handleHostLogin(dId: string, aId: string) {
    const currentCalendar: CalendarEntity | null = await CalendarEntity.findOne(
      {
        where: { dId },
      },
    );

    if (!currentCalendar) {
      const {
        googleToken,
        googleRefreshToken,
      }: { googleToken: string; googleRefreshToken: string } =
        await this.getTokensForGoogle(aId);

      const calendarId = await this.calendarService.getMentorsCalendarId(
        googleToken,
      );
      await CalendarEntity.create({
        dId,
        googleToken,
        googleRefreshToken,
        calendarId,
      });
    }
  }

  private async getTokensForGoogle(
    hostAuthId: string,
  ): Promise<{ googleToken: string; googleRefreshToken: string }> {
    try {
      const authManagementToken: string = await this.getTokenForAuthManagment();
      const {
        data: { identities },
      }: {
        data: { identities: { access_token: string; refresh_token: string }[] };
      } = await this.authzApiService.axiosInstance({
        method: 'GET',
        url: `/api/v2/users/${hostAuthId}`,
        headers: {
          Authorization: `Bearer ${authManagementToken}`,
        },
      });

      return {
        googleToken: identities[0].access_token,
        googleRefreshToken: identities[0].refresh_token,
      };
    } catch (err: any) {
      throw new Error(err?.message);
    }
  }

  private async getTokenForAuthManagment(): Promise<string> {
    const {
      data: { access_token },
    }: { data: { access_token: string } } =
      await this.authzApiService.axiosInstance({
        method: 'POST',
        url: '/oauth/token',
        data: {
          client_id: process.env.AUTHZ_CLIENT_ID,
          client_secret: process.env.AUTHZ_SECRET,
          audience: 'https://discord-calendar-bot-by-dd.eu.auth0.com/api/v2/',
          grant_type: 'client_credentials',
        },
      });
    return access_token;
  }
}
