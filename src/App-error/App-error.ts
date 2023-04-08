export class AppError extends Error {
  readonly causeErrors: AppError;
  constructor(readonly message: string, { causeErr }: { causeErr: AppError }) {
    super(message);
    this.name = 'BaseAppError';
    this.causeErrors = causeErr;
  }
}
