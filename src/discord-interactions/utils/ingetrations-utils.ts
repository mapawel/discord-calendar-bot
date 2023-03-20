import { AppCommandComponent } from '../../discord-commands/app-commands-SETUP/commands-components.list';
import { AppCommand } from '../../discord-commands/app-commands-SETUP/commands.list';

export function isItemProperType<T, D>(
  item: T | D,
  examinedProperty: keyof T,
): item is T {
  return (item as T)[examinedProperty] !== undefined;
}

export function joinAppCommandsWAppCommandsComp(
  commands: AppCommand[],
  commandsComponentsInObject: Record<string, AppCommandComponent[]>,
): (AppCommand | AppCommandComponent)[] {
  const itemsFromComandsComponend: AppCommandComponent[] = Object.values(
    commandsComponentsInObject,
  ).flat();

  return [...commands, ...itemsFromComandsComponend];
}
