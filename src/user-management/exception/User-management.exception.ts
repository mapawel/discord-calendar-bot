export class UserManagementException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserManagementException';
  }
}
