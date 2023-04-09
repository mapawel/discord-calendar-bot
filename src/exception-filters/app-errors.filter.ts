import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InteractionResponseType } from 'discord-interactions';
import { AppError } from '../App-error/App-error';
import { ResponseComponentsProvider } from '../discord-interactions/service/response-components.provider';
import { MappedInteractionDTO } from '../discord-interactions/dto/Interaction.dto';

@Catch()
export class AppErrorsFilter implements ExceptionFilter {
  constructor(
    private readonly responseComponentsProvider: ResponseComponentsProvider,
  ) {}

  async catch(exception: AppError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const {
      body: { id, token },
    }: { body: MappedInteractionDTO } = ctx.getRequest();

    const exceptionsArray: AppError[] = this.makeFlatAppErrorsArr(exception);

    this.printErrorsToConsole(exceptionsArray);

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

  private makeFlatAppErrorsArr(appErrorOrginal: any): AppError[] {
    let errorsArr: AppError[] = [];
    const run = (appError: AppError) => {
      errorsArr = [...errorsArr, appError];
      if (!!appError?.causeErrors) run(appError.causeErrors);
    };
    run(appErrorOrginal);
    return errorsArr;
  }

  private printErrorsToConsole(exceptionsArray: AppError[]): void {
    console.log(
      '\n',
      '>>>>>          MAIN APP EXCEPTIONS HANDLER:          <<<<<<',
    );
    console.log('\n', '> FULL EXCEPTIONS LIST: <', '\n');
    exceptionsArray.forEach((appError: AppError, i: number) =>
      console.error(
        `>>> Error no ${exceptionsArray.length - i}`,
        appError,
        '\n',
      ),
    );
    console.log('\n', '> SHORT EXCEPTIONS LIST: <', '\n');
    exceptionsArray.forEach((appError: AppError, i: number) =>
      console.error(
        `>>> Error no ${exceptionsArray.length - i}`,
        '\n',
        'Err name -> ',
        appError.name,
        '\n',
        'Err message -> ',
        appError.message,
        '\n',
      ),
    );
  }
}
