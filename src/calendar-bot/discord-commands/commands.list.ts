import { Commands } from './commands.enum';

export const commands = [
  {
    name: Commands.GET_MEETING,
    type: 1,
    description: 'Getting a meeting with people from our community',
    dm_permission: true,
  },
  {
    name: Commands.AUTHENTICATE,
    type: 1,
    description: 'Starting authentication process for calendar bot',
    dm_permission: true,
  },
];
