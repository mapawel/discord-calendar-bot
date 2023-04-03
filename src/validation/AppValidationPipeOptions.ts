import { ValidationPipeOptions } from './ValidationPipeOptions.interface';
import { BadRequestException } from '@nestjs/common';

export const AppValidationPipeOptions: ValidationPipeOptions = {
  transform: true,
  exceptionFactory(validationErrors) {
    return new BadRequestException({
      message: 'Bad request',
      errors: validationErrors,
    });
  },
};
