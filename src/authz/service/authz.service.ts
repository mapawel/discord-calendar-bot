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
import { AxiosProvider } from '../../axios/provider/axios.provider';
import { Calendar as CalendarEntity } from 'src/Calendar/entity/Calendar.entity';

config();

@Injectable()
export class AuthzService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly axiosProvider: AxiosProvider,
  ) {}

  public async buildRedirectLink(id: string): Promise<string> {
    const isUserMeetingHost: boolean =
      await this.rolesService.checkIfUserIsMeetingHost(id);
    const signedId = await this.jwtService.signAsync({ id });

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
      const { id } = await this.jwtService.verifyAsync(state);
      const { data } = await this.axiosProvider.axiosAuthzAPI({
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
        await this.axiosProvider.axiosAuthzAPI({
          method: 'POST',
          url: `${AuthzRoutes.GET_USET_INFO}`,
          headers: {
            Authorization: `Bearer ${data.access_token}`,
          },
        });

      const verifiedUser: AppUserDTO | undefined =
        await this.usersService.getUserByDId(id);
      if (!verifiedUser) throw new AuthServiceException('User not found');

      const fullAppUser: AppUserDTO = this.usersService.getFullAppUser(
        verifiedUser,
        authUserData,
      );

      this.usersService.updateUser(fullAppUser);
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

  public async getTokensForGoogle(
    hostAuthId: string,
  ): Promise<{ googleToken: string; googleRefreshToken: string }> {
    try {
      const authManagementToken: string = await this.getTokenForAuthManagment();
      const {
        data: { identities },
      }: {
        data: { identities: { access_token: string; refresh_token: string }[] };
      } = await this.axiosProvider.axiosAuthzAPI({
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
      throw new AuthServiceException(err?.message);
    }
  }

  public async refreshTokenForGoogle(dId: string): Promise<string> {
    try {
      const currentCalendar: CalendarEntity | null =
        await CalendarEntity.findByPk(dId);

      if (!currentCalendar?.googleRefreshToken)
        throw new AuthServiceException('Calendar access cannot be refreshed');

      const { googleRefreshToken }: { googleRefreshToken: string } =
        currentCalendar;

      const {
        data: { access_token },
      }: { data: { access_token: string } } =
        await this.axiosProvider.axiosGoogleAPI({
          method: 'POST',
          url: `https://www.googleapis.com/oauth2/v4/token`,
          data: {
            client_id: process.env.GOOGLE_API_CLIENT_ID,
            client_secret: process.env.GOOGLE_API_CLIENT_SECRET,
            refresh_token: googleRefreshToken,
            grant_type: 'refresh_token',
          },
        });

      return access_token;
    } catch (err: any) {
      throw new AuthServiceException(err?.message);
    }
  }

  private async getTokenForAuthManagment(): Promise<string> {
    const {
      data: { access_token },
    }: { data: { access_token: string } } =
      await this.axiosProvider.axiosAuthzAPI({
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
