import { Commands } from './commands.enum';

export const commands: AppCommands = [
  {
    name: Commands.GET_MEETING,
    type: 1,
    description: 'Getting a meeting with people from our community',
    dm_permission: true,
    authenticated_guard_rule: 'isAuthenticated',
    role_guard_rules: [],
  },
  {
    name: Commands.AUTHENTICATE,
    type: 1,
    description: 'Starting authentication process for calendar bot',
    dm_permission: true,
    authenticated_guard_rule: 'notAuthenticated',
    role_guard_rules: [],
  },
  {
    name: Commands.BOT_MANAGE,
    type: 1,
    description: 'Managing the bot by the bot-admins',
    dm_permission: true,
    authenticated_guard_rule: 'isAuthenticated',
    role_guard_rules: ['Calendar-bot-admin', 'Mentor'],
  },
];

type AppCommands = {
  name: Commands;
  type: number;
  description: string;
  dm_permission: boolean;
  authenticated_guard_rule: 'isAuthenticated' | 'notAuthenticated';
  role_guard_rules: ('Mentor' | 'Calendar-bot-admin')[]; // !!USE ROLE NAMES FROM DISCORD OR CHANGE NAMES IN THIS FILE! ROLE IDS ARE MANAGED BY THIS APP AND YOU DONT HAVE TO KNOW THEM!!
}[];
