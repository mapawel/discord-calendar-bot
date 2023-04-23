import { Controller, Res, Query, Get, UseFilters } from '@nestjs/common';
import { Response } from 'express';
import { AppRoutes } from '../../routes/routes.enum';
import { AuthzService } from '../service/authz.service';
import { AuthErrorsFilter } from '../filters/auth-errors.filter';

@UseFilters(AuthErrorsFilter)
@Controller(AppRoutes.LOGIN_CONTROLLER)
export class AuthzController {
  constructor(private readonly authzService: AuthzService) {}

  @Get(AppRoutes.LOGIN_METHOD)
  async authorize(@Query() { id }: { id: string }, @Res() res: Response) {
    const redirectLink = await this.authzService.buildRedirectLink(id);
    return res.redirect(redirectLink);
  }

  @Get(AppRoutes.LOGIN_CALLBACK_METHOD)
  async getToken(
    @Query()
    { code, state }: { code: string; state: string },
  ) {
    await this.authzService.getToken(code, state);
    return 'Authentication successfull! Now you can close this window and book a meeting in the Discord server.';
  }
}
