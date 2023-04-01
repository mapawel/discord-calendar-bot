import { CommandsComponents } from '../enums/commands-components.enum';

export const commandsComponents: Record<string, AppCommandComponent[]> = {
  managingBot: [
    {
      type: 2,
      label: 'add user to whitelist',
      style: 3,
      custom_id: CommandsComponents.ADD_TO_WHITELIST,
      authenticated_guard_rule: 'isAuthenticated',
      role_guard_rules: [],
      whitelisting_guard_rule: 'notWhitelisted',
      // role_guard_rules: ['Calendar-bot-admin', 'Mentor'],
      controller_service_method: 'addingUserToWhitelist',
    },
    {
      type: 2,
      label: 'remove user from whitelist',
      style: 4,
      custom_id: CommandsComponents.REMOVE_FROM_WHITELIST,
      authenticated_guard_rule: 'isAuthenticated',
      role_guard_rules: ['Calendar-bot-admin', 'Mentor'],
      whitelisting_guard_rule: 'notWhitelisted',
      controller_service_method: 'removingUserFromWhitelist',
    },
    {
      type: 2,
      label: 'establish user connections',
      style: 1,
      custom_id: CommandsComponents.SET_USER_CONNECTIONS,
      authenticated_guard_rule: 'isAuthenticated',
      role_guard_rules: ['Calendar-bot-admin', 'Mentor'],
      whitelisting_guard_rule: 'notWhitelisted',
      controller_service_method: 'settingUserConnections',
    },
  ],
  mentorToMeetWithButton: [
    {
      type: 2,
      label: 'to popualte in code...',
      style: 1,
      custom_id: CommandsComponents.MEETING_CALLBACK,
      authenticated_guard_rule: 'isAuthenticated',
      role_guard_rules: [],
      whitelisting_guard_rule: 'notWhitelisted',
      controller_service_method: 'meetingChooseMentorCallback',
    },
  ],
};

export type AppCommandComponent = {
  type: number;
  label: string;
  style: number;
  custom_id: CommandsComponents;
  authenticated_guard_rule: 'isAuthenticated' | 'notAuthenticated';
  role_guard_rules: ('Mentor' | 'Calendar-bot-admin')[]; // !!USE ROLE NAMES FROM DISCORD OR CHANGE NAMES IN THIS FILE! ROLE IDS ARE MANAGED BY THIS APP AND YOU DONT HAVE TO KNOW THEM!!
  whitelisting_guard_rule: 'isWhitelisted' | 'notWhitelisted';
  controller_service_method:
    | 'addingUserToWhitelist'
    | 'removingUserFromWhitelist'
    | 'settingUserConnections'
    | 'meetingChooseMentorCallback';
};
