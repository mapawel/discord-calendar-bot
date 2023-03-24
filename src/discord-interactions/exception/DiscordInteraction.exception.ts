export class DiscordInteractionException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DiscordInteractionException';
  }
}
