import { Commands } from './commands.enum';

export const commands: AppCommand[] = [
  {
    name: Commands.GET_MEETING,
    type: 1,
    description: 'Getting a meeting with people from our community',
    dm_permission: true,
    authenticated_guard_rule: 'isAuthenticated',
    role_guard_rules: [],
    controller_service_method: 'responseForMeeting',
    content: 'Redirecting to the calendar...',
  },
  {
    name: Commands.AUTHENTICATE,
    type: 1,
    description: 'Starting authentication process for calendar bot',
    dm_permission: true,
    authenticated_guard_rule: 'notAuthenticated',
    role_guard_rules: [],
    controller_service_method: 'authenticate',
    content: 'Start authentication with Auth0',
  },
  {
    name: Commands.BOT_MANAGE,
    type: 1,
    description: 'Managing the bot by the bot-admins',
    dm_permission: true,
    authenticated_guard_rule: 'isAuthenticated',
    // role_guard_rules: ['Calendar-bot-admin', 'Mentor'],
    role_guard_rules: [],
    controller_service_method: 'managingBot',
    content: 'What do you want to do?',
  },
];

export type AppCommand = {
  name: Commands;
  type: number;
  description: string;
  dm_permission: boolean;
  authenticated_guard_rule: 'isAuthenticated' | 'notAuthenticated';
  role_guard_rules: ('Mentor' | 'Calendar-bot-admin')[]; // !!USE ROLE NAMES FROM DISCORD OR CHANGE NAMES IN THIS FILE! ROLE IDS ARE MANAGED BY THIS APP AND YOU DONT HAVE TO KNOW THEM!!
  controller_service_method:
    | 'responseForMeeting'
    | 'authenticate'
    | 'managingBot';
  content: string;
};
