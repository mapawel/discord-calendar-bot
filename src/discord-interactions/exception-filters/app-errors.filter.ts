import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InteractionResponseType } from 'discord-interactions';
import { AppError } from 'src/App-error/App-error';
import { ResponseComponentsProvider } from '../service/response-components.provider';
import { MappedInteractionDTO } from '../dto/Interaction.dto';

@Catch()
export class AppErrorsFilter implements ExceptionFilter {
  constructor(
    private readonly responseComponentsProvider: ResponseComponentsProvider,
  ) {}

  catch(exception: AppError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const body: MappedInteractionDTO = request.body;
    const { id, token } = body;

    const exceptionsArray: AppError[] = this.makeFlatAppErrorsArr(exception);

    for (const appError of exceptionsArray) {
      if (appError instanceof ForbiddenException)
        return this.responseComponentsProvider.generateInteractionResponse({
          id,
          token,
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          content: appError.message,
        });

      if (appError instanceof BadRequestException)
        return this.responseComponentsProvider.generateInteractionResponse({
          id,
          token,
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          content:
            'Input accepts numbers only, 18 characters long! Pass correct Discord ID!',
        });

      if (appError instanceof NotFoundException)
        return this.responseComponentsProvider.generateInteractionResponse({
          id,
          token,
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          content: `Resource not found! ${appError.message}`,
        });
    }
    return this.responseComponentsProvider.generateInteractionResponse({
      id,
      token,
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      content: 'Server error! Try again later!',
    });
  }

  private makeFlatAppErrorsArr(appErrorOrginal: any): AppError[] {
    let errorsArr: AppError[] = [];
    const run = (appError: AppError) => {
      errorsArr = [...errorsArr, appError];
      if (!!appError?.causeErrors) run(appError.causeErrors);
    };
    run(appErrorOrginal);
    return errorsArr;
  }
}
