import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { AppError } from '../../App-error/App-error';
import { Response } from 'express';
import { getErrorString } from 'src/App-error/error.helpers';
import { makeFlatAppErrorsArr } from 'src/App-error/error.helpers';

@Catch()
export class AuthErrorsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  async catch(exception: AppError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res: Response = ctx.getResponse();
    const exceptionsArray: AppError[] = makeFlatAppErrorsArr(exception);

    const errorString: string = getErrorString(exceptionsArray);
    this.logger.error(errorString);

    for (const appError of exceptionsArray) {
      if (appError instanceof ForbiddenException)
        return res.status(403).json({
          success: false,
          message: 'Forbidden',
        });

      if (appError instanceof BadRequestException)
        return res.status(400).json({
          success: false,
          message: 'Bad request',
        });

      if (appError instanceof NotFoundException)
        return res.status(404).json({
          success: false,
          message: 'Not found',
        });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
}
