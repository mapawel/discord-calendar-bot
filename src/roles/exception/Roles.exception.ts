export class RolesException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RolesException';
  }
}
