import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { config } from 'dotenv';
import { AppRoutes } from 'src/app-routes/app-routes.enum';
import { AuthzRoutes } from 'src/app-routes/app-routes.enum';
import { AuthServiceException } from './exceptions/auth-service.exception';
import { JwtService } from '@nestjs/jwt';
import { JsonWebTokenError } from 'jsonwebtoken';
import { UsersService } from 'src/users/providers/users.service';
import { AppUserDTO } from 'src/users/dto/App-user.dto';
import { RolesService } from 'src/roles/providers/roles.service';
import { settings } from 'src/app-SETUP/settings';
import { AuthzUserDTO } from 'src/discord-interactions/dto/Auth-user.dto';

config();

@Injectable()
export class AuthzService {
  private authManagementToken: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
  ) {}

  public async buildRedirectLink(id: string): Promise<string> {
    const isUserMeetingHost: boolean = await this.checkIfUserIsMeetingHost(id);
    const signedId = await this.jwtService.signAsync({ id });

    const querystring: URLSearchParams = new URLSearchParams({
      audience: `${process.env.AUTH0_AUDIENCE}`,
      connection: isUserMeetingHost ? 'google-oauth2' : '',
      response_type: 'code',
      scope: 'openid profile email',
      client_id: `${process.env.AUTHZ_CLIENT_ID}`,
      state: signedId,
      redirect_uri: `${process.env.APP_BASE_URL}${AppRoutes.LOGIN_CONTROLLER}${AppRoutes.LOGIN_CALLBACK_METHOD}`,
    });

    return `${process.env.AUTHZ_API_URL}${AuthzRoutes.AUTHZ_AUTHORIZE}?${querystring}`;
  }

  public async getToken(code: string, state: string) {
    try {
      const { id } = await this.jwtService.verifyAsync(state);
      const { data } = await axios({
        method: 'POST',
        url: `${process.env.AUTHZ_API_URL}${AuthzRoutes.AUTHZ_TOKEN}`,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
          grant_type: 'authorization_code',
          client_id: process.env.AUTHZ_CLIENT_ID,
          client_secret: process.env.AUTHZ_SECRET,
          code,
          redirect_uri: `${process.env.APP_BASE_URL}${AppRoutes.LOGIN_CONTROLLER}${AppRoutes.LOGIN_CALLBACK_METHOD}`,
        },
      });

      const { data: authUserData }: { data: AuthzUserDTO } = await axios({
        method: 'POST',
        url: `${process.env.AUTHZ_API_URL}${AuthzRoutes.GET_USET_INFO}`,
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${data.access_token}`,
        },
      });

      const verifiedUser: AppUserDTO | undefined =
        await this.usersService.getUserByDId(id);
      if (!verifiedUser) throw new AuthServiceException('User not found');

      const fullAppUser: AppUserDTO = this.getFullAppUser(
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

  public async getTokenForGoogle(hostAuthId: string): Promise<string> {
    if (!this.authManagementToken)
      this.authManagementToken = await this.getTokenForAuthManagment();
    const {
      data: { identities },
    }: { data: { identities: { access_token: string }[] } } = await axios({
      method: 'GET',
      url: `https://discord-calendar-bot-by-dd.eu.auth0.com/api/v2/users/${hostAuthId}`,
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${this.authManagementToken}`,
      },
    });

    return identities[0].access_token;
  }

  private async checkIfUserIsMeetingHost(dId: string): Promise<boolean> {
    const userRoles: string[] = await this.rolesService.getUserRole(dId);
    const rolesUsersCanMeetWith =
      await this.rolesService.translateRoleNamesToIds(
        settings.rolesUsersCanMeetWith,
      );
    return userRoles.some((role) => rolesUsersCanMeetWith.includes(role));
  }

  private getFullAppUser(
    verifiedUser: AppUserDTO,
    authUserData: AuthzUserDTO,
  ): AppUserDTO {
    return {
      ...verifiedUser,
      name: authUserData.name,
      picture: authUserData.picture,
      authenticated: true,
      IdP: authUserData.sub.split('|')[0],
      aId: authUserData.sub,
      email: authUserData.email,
    };
  }

  private async getTokenForAuthManagment(): Promise<string> {
    const {
      data: { access_token },
    }: { data: { access_token: string } } = await axios({
      method: 'POST',
      url: 'https://discord-calendar-bot-by-dd.eu.auth0.com/oauth/token',
      headers: { 'content-type': 'application/json' },
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
