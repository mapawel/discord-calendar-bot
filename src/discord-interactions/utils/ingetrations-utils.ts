import { AppCommandSelectComponent } from 'src/app-SETUP/commands-select-components.list';
import { AppCommandComponent } from '../../app-SETUP/commands-components.list';

export function getAllCommandComponentsFromObj(
  commandsComponentsInObject: Record<
    string,
    AppCommandComponent[] | AppCommandSelectComponent[]
  >,
): (AppCommandComponent | AppCommandSelectComponent)[] {
  return Object.values(commandsComponentsInObject).flat();
}
