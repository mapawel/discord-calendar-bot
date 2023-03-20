import { AppCommandComponent } from '../../discord-commands/app-commands-SETUP/commands-components.list';

export function getAllCommandComponentsFromObj(
  commandsComponentsInObject: Record<string, AppCommandComponent[]>,
): AppCommandComponent[] {
  return Object.values(commandsComponentsInObject).flat();
}
