import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import {
  InteractionWMemberDTO,
  InteractionWUserDTO,
} from '../discord-interactions/dto/Interaction.dto';
import { DiscordUserDTO } from '../discord-interactions/dto/Discord-user.dto';

@Injectable()
export class MapDiscUserMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const body: InteractionWMemberDTO | InteractionWUserDTO = req.body;
    const discordUser: DiscordUserDTO = body.user || body.member?.user;

    req.body.discord_usr = discordUser;

    next();
  }
}
