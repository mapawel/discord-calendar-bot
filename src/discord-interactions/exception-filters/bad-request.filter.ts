import { config } from 'dotenv';
import {
  ExceptionFilter,
  Catch,
  BadRequestException,
  ArgumentsHost,
} from '@nestjs/common';
import { Response } from 'express';
import { InteractionResponseType } from 'discord-interactions';

config();

@Catch(BadRequestException)
export class BadRequestFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(201).json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content:
          '!-> Input accepts numbers only, 18 characters long! Pass correct Discord ID <-!',
      },
    });
  }
}
