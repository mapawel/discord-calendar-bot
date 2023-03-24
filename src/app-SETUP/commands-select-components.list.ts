import { CommandsSelectComponents } from './commands-select-components.enum';

export const commandsSelectComponents: Record<
  string,
  AppCommandSelectComponent[]
> = {
  managingBotSelectAdding: [
    {
      type: 3,
      custom_id: CommandsSelectComponents.SELECT_USER_TO_ADD,
      options: [
        {
          label: 'to replace in app code',
          value: 'to replace in app code',
          description: 'to replace in app code',
        },
      ],
      placeholder: 'discord user',
      min_value: 1,
      max_value: 1,
      authenticated_guard_rule: 'isAuthenticated',
      role_guard_rules: ['Calendar-bot-admin', 'Mentor'],
      whitelisting_guard_rule: 'notWhitelisted',

      controller_service_method: 'addingUserToWhitelistCallback',
    },
  ],
  managingBotSelectRemoving: [
    {
      type: 3,
      custom_id: CommandsSelectComponents.SELECT_USER_TO_REMOVE,
      options: [
        {
          label: 'to replace in app code',
          value: 'to replace in app code',
          description: 'to replace in app code',
        },
      ],
      placeholder: 'discord user',
      min_value: 1,
      max_value: 1,
      authenticated_guard_rule: 'isAuthenticated',
      role_guard_rules: ['Calendar-bot-admin', 'Mentor'],
      whitelisting_guard_rule: 'notWhitelisted',
      controller_service_method: 'removingUserFromWhitelistCallback',
    },
  ],
  managingBotSelectUserToConnect: [
    {
      type: 3,
      custom_id: CommandsSelectComponents.SELECT_USER_TO_CONNECT,
      options: [
        {
          label: 'to replace in app code',
          value: 'to replace in app code',
          description: 'to replace in app code',
        },
      ],
      placeholder: 'discord user',
      min_value: 1,
      max_value: 1,
      authenticated_guard_rule: 'isAuthenticated',
      role_guard_rules: ['Calendar-bot-admin', 'Mentor'],
      whitelisting_guard_rule: 'notWhitelisted',
      controller_service_method: 'connectingUserToMentorCallback',
    },
  ],
  managingBotSelectMentorToConnect: [
    {
      type: 3,
      custom_id: CommandsSelectComponents.SELECT_MENTOR_TO_CONNECT,
      options: [
        {
          label: 'to replace in app code',
          value: 'to replace in app code',
          description: 'to replace in app code',
        },
      ],
      placeholder: 'discord user to meet',
      min_value: 1,
      max_value: 1,
      authenticated_guard_rule: 'isAuthenticated',
      role_guard_rules: ['Calendar-bot-admin', 'Mentor'],
      whitelisting_guard_rule: 'notWhitelisted',
      controller_service_method: 'connectingUserToMentorCallback2',
    },
  ],
};

export type AppCommandSelectComponent = {
  type: 3;
  options: { value: string; label: string; description: string }[];
  custom_id: CommandsSelectComponents;
  placeholder: string;
  min_value: number;
  max_value: number;
  authenticated_guard_rule: 'isAuthenticated' | 'notAuthenticated';
  role_guard_rules: ('Mentor' | 'Calendar-bot-admin')[]; // !!USE ROLE NAMES FROM DISCORD OR CHANGE NAMES IN THIS FILE! ROLE IDS ARE MANAGED BY THIS APP AND YOU DONT HAVE TO KNOW THEM!!
  whitelisting_guard_rule: 'isWhitelisted' | 'notWhitelisted';
  controller_service_method:
    | 'addingUserToWhitelist'
    | 'removingUserFromWhitelist'
    | 'addingUserToWhitelistCallback'
    | 'removingUserFromWhitelistCallback'
    | 'settingUserConnections'
    | 'connectingUserToMentorCallback'
    | 'connectingUserToMentorCallback2';
};
