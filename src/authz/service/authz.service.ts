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

config();

@Injectable()
export class AuthzService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async buildRedirectLink(id: string): Promise<string> {
    const signedId = await this.jwtService.signAsync({ id });

    const querystring: URLSearchParams = new URLSearchParams({
      audience: `${process.env.AUTH0_AUDIENCE}`,
      response_type: 'code',
      scope: 'openid profile email',
      client_id: `${process.env.AUTHZ_CLIENT_ID}`,
      state: signedId,
      redirect_uri: `${process.env.APP_BASE_URL}${AppRoutes.LOGIN_CONTROLLER}${AppRoutes.LOGIN_CALLBACK_METHOD}`,
    });

    return `${process.env.AUTHZ_API_URL}${AuthzRoutes.AUTHZ_AUTHORIZE}?${querystring}`;
  }

  async getToken(code: string, state: string) {
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

      const {
        data: authUserData,
      }: {
        data: { sub: string; name: string; picture: string; email: string };
      } = await axios({
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

      const userWithFullData: AppUserDTO = {
        ...verifiedUser,
        name: authUserData.name,
        picture: authUserData.picture,
        authenticated: true,
        IdP: authUserData.sub.split('|')[0],
        aId: authUserData.sub.split('|')[1],
        email: authUserData.email,
      };

      this.usersService.updateUser(userWithFullData);
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
}
