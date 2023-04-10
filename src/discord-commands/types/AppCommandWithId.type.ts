import { AppCommand } from '../../app-SETUP/lists/commands.list';

export type AppCommandWithId = AppCommand & {
  id: string;
};
