import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import {
  InteractionWMemberDTO,
  InteractionWUserDTO,
} from '../dto/interaction.dto';
import { UserDto } from '../dto/user.dto';

@Injectable()
export class MapDiscUserMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    console.log('body ----> ', req.body);
    const body: InteractionWMemberDTO | InteractionWUserDTO = req.body;
    const appUser: UserDto = body.user || body.member?.user;

    req.body.discord_usr = appUser;

    next();
  }
}
