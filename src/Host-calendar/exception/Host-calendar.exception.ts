import { AppError } from '../../App-error/App-error';

export class HostCalendarException extends AppError {
  constructor(message: string, { causeErr }: { causeErr: AppError }) {
    super(message, { causeErr });
    this.name = 'HostCalendarException';
  }
}
