export class DBException extends Error {
  constructor(readonly message: string) {
    super(message);
    this.name = 'DBException';
  }
}
