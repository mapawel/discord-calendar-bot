import { AppError } from '../../App-error/App-error';

export class RolesException extends AppError {
  constructor(readonly message: string, { causeErr }: { causeErr: AppError }) {
    super(message, { causeErr });
    this.name = 'RolesException';
  }
}
