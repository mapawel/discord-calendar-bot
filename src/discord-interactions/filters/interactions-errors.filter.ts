import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InteractionResponseType } from 'discord-interactions';
import { AppError } from '../../App-error/App-error';
import { ResponseComponentsProvider } from '../service/response-components.provider';
import { MappedInteractionDTO } from '../dto/Interaction.dto';
import { makeFlatAppErrorsArr } from 'src/App-error/error.helpers';
import { logError } from 'src/App-error/error.helpers';

@Catch()
export class InteractionsErrorsFilter implements ExceptionFilter {
  constructor(
    private readonly responseComponentsProvider: ResponseComponentsProvider,
  ) {}

  async catch(exception: AppError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const {
      body: { id, token },
    }: { body: MappedInteractionDTO } = ctx.getRequest();
    const exceptionsArray: AppError[] = makeFlatAppErrorsArr(exception);

    logError(exceptionsArray);

    for (const appError of exceptionsArray) {
      if (appError instanceof ForbiddenException)
        return await this.responseComponentsProvider.generateInteractionResponse(
          {
            id,
            token,
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            content: appError.message,
          },
        );

      if (appError instanceof BadRequestException)
        return await this.responseComponentsProvider.generateInteractionResponse(
          {
            id,
            token,
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            content:
              'Input accepts numbers only, 18 characters long! Pass correct Discord ID!',
          },
        );

      if (appError instanceof NotFoundException)
        return await this.responseComponentsProvider.generateInteractionResponse(
          {
            id,
            token,
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            content: `Resource not found! ${appError.message}`,
          },
        );
    }
    return await this.responseComponentsProvider.generateInteractionResponse({
      id,
      token,
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      content: 'Server error! Try again later!',
    });
  }
}
