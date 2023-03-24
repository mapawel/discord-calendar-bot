import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import {
  InteractionWMemberDTO,
  InteractionWUserDTO,
} from '../dto/interaction.dto';
import { UserDTO } from 'src/user-management/dto/User.dto';

@Injectable()
export class MapDiscUserMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const body: InteractionWMemberDTO | InteractionWUserDTO = req.body;
    const appUser: UserDTO = body.user || body.member?.user;

    req.body.discord_usr = appUser;

    next();
  }
}
