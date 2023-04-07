import { AppCommandComponent } from '../commands-components.list';
import { AppCommandModalComponent } from '../commands-modal-components.list';
import { AppCommandSelectComponent } from '../commands-select-components.list';

export type AppAllCommandComponentsType =
  | AppCommandComponent
  | AppCommandSelectComponent
  | AppCommandModalComponent;
