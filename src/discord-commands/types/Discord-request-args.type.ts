import { AppCommand } from '../../app-SETUP/lists/commands.list';

export type DiscordRequestArgs = {
  method: 'GET' | 'POST' | 'DELETE';
  data?: AppCommand;
  url?: string;
};
