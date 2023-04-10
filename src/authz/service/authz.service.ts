import { Injectable } from '@nestjs/common';
import { AppRoutes } from '../../routes/routes.enum';
import { AuthzServiceException } from '../exceptions/Authz-service.exception';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/providers/users.service';
import { AppUserDTO } from '../../users/dto/App-user.dto';
import { RolesService } from '../../roles/providers/roles.service';
import { AuthzUserDTO } from '../dto/Auth-user.dto';
import { AuthzApiService } from 'src/APIs/Authz-api.service';
import { HostCalendar } from 'src/Host-calendar/entity/Host-calendar.entity';
import { HostCalendarService } from 'src/Host-calendar/services/Host-calendar.service';
import { AxiosResponse } from 'axios';
import { isStatusValid } from 'src/APIs/APIs.helpers';

@Injectable()
export class AuthzService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly authzApiService: AuthzApiService,
    private readonly hostCalendarService: HostCalendarService,
  ) {}

  public async buildRedirectLink(id: string): Promise<string> {
    try {
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
        client_id: `${process.env.AUTH0_CLIENT_ID}`,
        state: signedId,
        redirect_uri: `${process.env.APP_BASE_URL}${AppRoutes.LOGIN_CONTROLLER}${AppRoutes.LOGIN_CALLBACK_METHOD}`,
        scope: 'openid profile email',
        access_type: 'offline',
        approval_prompt: 'force',
        // prompt: 'consent'
      });

      return `${process.env.AUTH0_API_URL}${process.env.AUTH0_AUTHORIZE_ROUTE}?${querystring}`;
    } catch (err: any) {
      throw new AuthzServiceException(err.message, { causeErr: err });
    }
  }

  public async getToken(code: string, state: string): Promise<void> {
    try {
      const { id, isHost } = await this.jwtService.verifyAsync(state);
      const { data, status }: AxiosResponse =
        await this.authzApiService.axiosInstance({
          method: 'POST',
          url: `${process.env.AUTH0_TOKEN_ROUTE}`,
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          data: {
            grant_type: 'authorization_code',
            client_id: process.env.AUTH0_CLIENT_ID,
            client_secret: process.env.AUTH0_SECRET,
            code,
            redirect_uri: `${process.env.APP_BASE_URL}${AppRoutes.LOGIN_CONTROLLER}${AppRoutes.LOGIN_CALLBACK_METHOD}`,
          },
        });
      if (!isStatusValid(status))
        throw new Error(`Auth API error while getting a token: ${status}`);

      const {
        data: authUserData,
        status: fetchUserStatus,
      }: { data: AuthzUserDTO; status: number } =
        await this.authzApiService.axiosInstance({
          method: 'POST',
          url: `${process.env.AUTH0_GET_USER_INFO_ROUTE}`,
          headers: {
            Authorization: `Bearer ${data.access_token}`,
          },
        });
      if (!isStatusValid(fetchUserStatus))
        throw new Error(
          `Auth API error while fetching auth user data: ${status}`,
        );

      const verifiedUser: AppUserDTO | undefined =
        await this.usersService.getUserByDId(id);
      if (!verifiedUser) throw new Error('User not found, could not login!');

      const fullAppUser: AppUserDTO = this.usersService.getFullAppUser(
        verifiedUser,
        authUserData,
      );

      await this.usersService.updateUser(fullAppUser);

      if (isHost) this.handleHostLogin(id, fullAppUser.aId);
    } catch (err: any) {
      throw new AuthzServiceException(
        `Error while getting a token: ${err.message}`,
        { causeErr: err },
      );
    }
  }

  private async handleHostLogin(dId: string, aId: string): Promise<void> {
    try {
      const currentCalendar: HostCalendar | null = await HostCalendar.findOne({
        where: { dId },
      });

      if (!currentCalendar) {
        const {
          googleToken,
          googleRefreshToken,
        }: { googleToken: string; googleRefreshToken: string } =
          await this.getTokensForGoogle(aId);

        const calendarId = await this.hostCalendarService.getMentorsCalendarId(
          googleToken,
        );
        await HostCalendar.create({
          dId,
          googleToken,
          googleRefreshToken,
          calendarId,
        });
      }
    } catch (err: any) {
      throw new AuthzServiceException(err.message, { causeErr: err });
    }
  }

  private async getTokensForGoogle(
    hostAuthId: string,
  ): Promise<{ googleToken: string; googleRefreshToken: string }> {
    try {
      const authManagementToken: string = await this.getTokenForAuthManagment();
      const {
        data: { identities },
        status,
      }: {
        data: { identities: { access_token: string; refresh_token: string }[] };
        status: number;
      } = await this.authzApiService.axiosInstance({
        method: 'GET',
        url: `${process.env.AUTH0_API_ROUTE}users/${hostAuthId}`,
        headers: {
          Authorization: `Bearer ${authManagementToken}`,
        },
      });

      if (!isStatusValid(status))
        throw new Error(
          `Auth API error while getting a token for google from auth0: ${status}`,
        );

      return {
        googleToken: identities[0].access_token,
        googleRefreshToken: identities[0].refresh_token,
      };
    } catch (err: any) {
      throw new AuthzServiceException(err?.message, { causeErr: err });
    }
  }

  private async getTokenForAuthManagment(): Promise<string> {
    try {
      const {
        data: { access_token },
        status,
      }: { data: { access_token: string }; status: number } =
        await this.authzApiService.axiosInstance({
          method: 'POST',
          url: process.env.AUTH0_TOKEN_ROUTE,
          data: {
            client_id: process.env.AUTH0_CLIENT_ID,
            client_secret: process.env.AUTH0_SECRET,
            audience: `${process.env.AUTH0_API_URL}${process.env.AUTH0_API_ROUTE}`,
            grant_type: 'client_credentials',
          },
        });

      if (!isStatusValid(status))
        throw new Error(
          `Auth API error while getting a token for Auth0 management: ${status}`,
        );

      return access_token;
    } catch (err: any) {
      throw new AuthzServiceException(err.message, { causeErr: err });
    }
  }
}
