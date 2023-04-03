import { AppCommandSelectComponent } from '../../app-SETUP/lists/commands-select-components.list';
import { AppCommandComponent } from '../../app-SETUP/lists/commands-components.list';
import { AppCommandModalComponent } from 'src/app-SETUP/lists/commands-modal-components.list';

export function getAllCommandComponentsFromObj(
  commandsComponentsInObject: Record<
    string,
    | AppCommandComponent[]
    | AppCommandSelectComponent[]
    | AppCommandModalComponent[]
  >,
): (
  | AppCommandComponent
  | AppCommandSelectComponent
  | AppCommandModalComponent
)[] {
  return Object.values(commandsComponentsInObject).flat();
}
