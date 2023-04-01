import { AppCommandSelectComponent } from '../../app-SETUP/lists/commands-select-components.list';
import { AppCommandComponent } from '../../app-SETUP/lists/commands-components.list';

export function getAllCommandComponentsFromObj(
  commandsComponentsInObject: Record<
    string,
    AppCommandComponent[] | AppCommandSelectComponent[]
  >,
): (AppCommandComponent | AppCommandSelectComponent)[] {
  return Object.values(commandsComponentsInObject).flat();
}
