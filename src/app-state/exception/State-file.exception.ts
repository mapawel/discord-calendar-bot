export class StateFileException extends Error {
  public constructor(readonly message: string) {
    super(message);
  }
}
