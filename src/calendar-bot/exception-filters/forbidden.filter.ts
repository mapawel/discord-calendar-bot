import { config } from 'dotenv';
import {
  ExceptionFilter,
  Catch,
  ForbiddenException,
  ArgumentsHost,
} from '@nestjs/common';
import { Response } from 'express';
import { InteractionResponseType } from 'discord-interactions';
import { Commands } from '../discord-commands/commands.enum';

config();

@Catch(ForbiddenException)
export class ForbiddenExceptionFilter implements ExceptionFilter {
  catch(exception: ForbiddenException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(201).json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Brak autentykacji! Najpierw potwierdź tożsamość zaczynając komendą: "/${Commands.AUTHENTICATE}"`,
      },
    });
  }
}
