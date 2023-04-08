import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { InteractionResponseType } from 'discord-interactions';

@Catch()
export class RestErrorsFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    console.log('>>>>>>>>>>>>>>> rest filters > exception', exception);
    response.status(201).json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Server Error! Try again ...',
      },
    });
  }
}
