import { commandsComponents } from '../../app-SETUP/lists/commands-components.list';
import { commandsSelectComponents } from '../../app-SETUP/lists/commands-select-components.list';
import { commandsModalComponents } from 'src/app-SETUP/lists/commands-modal-components.list';
import { AppCommandComponent } from '../../app-SETUP/lists/commands-components.list';
import { AppCommandSelectComponent } from '../../app-SETUP/lists/commands-select-components.list';
import { AppCommandModalComponent } from 'src/app-SETUP/lists/commands-modal-components.list';

const getAllCommandComponentsFromObj = (
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
)[] => Object.values(commandsComponentsInObject).flat();

export const allCommandsComponents: (
  | AppCommandComponent
  | AppCommandSelectComponent
  | AppCommandModalComponent
)[] = getAllCommandComponentsFromObj({
  ...commandsComponents,
  ...commandsSelectComponents,
  ...commandsModalComponents,
});
