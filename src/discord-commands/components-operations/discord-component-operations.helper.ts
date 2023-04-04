import { commandsComponents } from '../../app-SETUP/lists/commands-components.list';
import { commandsSelectComponents } from '../../app-SETUP/lists/commands-select-components.list';
import { commandsModalComponents } from 'src/app-SETUP/lists/commands-modal-components.list';
import { AppCommandComponent } from '../../app-SETUP/lists/commands-components.list';
import { AppCommandSelectComponent } from '../../app-SETUP/lists/commands-select-components.list';
import { AppCommandModalComponent } from 'src/app-SETUP/lists/commands-modal-components.list';
import { AppCommand } from 'src/app-SETUP/lists/commands.list';

type CommandComponentsType = (
  | AppCommandComponent
  | AppCommandSelectComponent
  | AppCommandModalComponent
)[];

const getAllCommandComponentsFromObj = (
  commandsComponentsInObject: Record<string, CommandComponentsType>,
): (
  | AppCommandComponent
  | AppCommandSelectComponent
  | AppCommandModalComponent
)[] => Object.values(commandsComponentsInObject).flat();

export const allCommandsComponents: CommandComponentsType =
  getAllCommandComponentsFromObj({
    ...commandsComponents,
    ...commandsSelectComponents,
    ...commandsModalComponents,
  });

export const getInteractionSettingObject = (
  type: number,
  interacionName: string | undefined,
  interactionId: string | undefined,
  slashCommands: AppCommand[],
  commandComponents: CommandComponentsType,
) =>
  type === 2
    ? slashCommands.find((integration) => integration.name === interacionName)
    : type === 3 || type === 5
    ? commandComponents.find((integration) =>
        interactionId?.includes(integration.custom_id),
      )
    : null;
