import { CommandsSelectComponents } from './commands-select-components.enum';

export const commandsSelectComponents: Record<
  string,
  AppCommandSelectComponent[]
> = {
  managingBotSelect1: [
    {
      type: 3,
      custom_id: CommandsSelectComponents.SELECT_USER,
      options: [
        {
          label: 'to replace in app code',
          value: 'to replace in app code',
        },
      ],
      placeholder: 'Select user',
      min_value: 1,
      max_value: 20,
      authenticated_guard_rule: 'isAuthenticated',
      role_guard_rules: ['Calendar-bot-admin', 'Mentor'],
      controller_service_method: 'addingUserToWhitelist',
    },
  ],
};

export type AppCommandSelectComponent = {
  type: 3;
  options: { value: string; label: string }[];
  custom_id: CommandsSelectComponents;
  placeholder: string;
  min_value: number;
  max_value: number;
  authenticated_guard_rule: 'isAuthenticated' | 'notAuthenticated';
  role_guard_rules: ('Mentor' | 'Calendar-bot-admin')[]; // !!USE ROLE NAMES FROM DISCORD OR CHANGE NAMES IN THIS FILE! ROLE IDS ARE MANAGED BY THIS APP AND YOU DONT HAVE TO KNOW THEM!!
  controller_service_method:
    | 'addingUserToWhitelist'
    | 'removingUserFromWhitelist'
    | 'settingUserConnections';
};
