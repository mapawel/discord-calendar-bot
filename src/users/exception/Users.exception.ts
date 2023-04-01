export class UsersException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UsersException';
  }
}
