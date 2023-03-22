import { AppCommandSelectComponent } from 'src/discord-commands/app-commands-SETUP/commands-select-components.list';
import { AppCommandComponent } from '../../discord-commands/app-commands-SETUP/commands-components.list';

export function getAllCommandComponentsFromObj(
  commandsComponentsInObject: Record<
    string,
    AppCommandComponent[] | AppCommandSelectComponent[]
  >,
): (AppCommandComponent | AppCommandSelectComponent)[] {
  return Object.values(commandsComponentsInObject).flat();
}
