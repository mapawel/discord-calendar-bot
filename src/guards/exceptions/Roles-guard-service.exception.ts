import { AppError } from '../../App-error/App-error';

export class RolesGuarsServiceException extends AppError {
  constructor(readonly message: string, { causeErr }: { causeErr: AppError }) {
    super(message, { causeErr });
    this.name = 'RolesGuarsServiceException';
  }
}
