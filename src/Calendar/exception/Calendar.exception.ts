import { AppError } from '../../App-error/App-error';

export class CalendarException extends AppError {
  constructor(message: string, { causeErr }: { causeErr: AppError }) {
    super(message, { causeErr });
    this.name = 'CalendarException';
  }
}
