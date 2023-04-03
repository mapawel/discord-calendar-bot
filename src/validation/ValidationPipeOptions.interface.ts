import { ValidatorOptions } from 'class-validator';
import { ValidationError } from 'class-validator';

export interface ValidationPipeOptions extends ValidatorOptions {
  transform?: boolean;
  exceptionFactory?: (errors: ValidationError[]) => any;
}