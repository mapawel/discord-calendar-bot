import { AppError } from '../../App-error/App-error';

export class UsersServiceException extends AppError {
  constructor(readonly message: string, { causeErr }: { causeErr: AppError }) {
    super(message, { causeErr });
  }
}
