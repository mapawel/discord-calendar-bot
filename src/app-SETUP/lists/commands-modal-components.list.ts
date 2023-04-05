import { CommandsModalComponents } from '../enums/commands-modal-components.enum';

export const commandsModalComponents: Record<
  string,
  [AppCommandModalComponent]
> = {
  managingBotModalAdding: [
    {
      modal_title: 'Adding user to whitelist',
      custom_id: CommandsModalComponents.INPUT_USER_TO_ADD,
      component_label: "User's to add to whitelist discord ID",
      component_placeholder: 'Enter discord ID',
      component_min_l: 18,
      component_max_l: 20,
      authenticated_guard_rule: 'isAuthenticated',
      role_guard_rules: ['Mentor', 'Calendar-bot-admin'],
      whitelisting_guard_rule: 'notWhitelisted',
      controller_service_method: 'addingUserToWhitelistCallback',
    },
  ],
  managingBotModalRemoving: [
    {
      modal_title: 'Removing user from whitelist',
      custom_id: CommandsModalComponents.INPUT_USER_TO_REMOVE,
      component_label: "User's to remove from whitelist discord ID",
      component_placeholder: 'Enter discord ID',
      component_min_l: 18,
      component_max_l: 20,
      authenticated_guard_rule: 'isAuthenticated',
      role_guard_rules: ['Mentor', 'Calendar-bot-admin'],
      whitelisting_guard_rule: 'notWhitelisted',
      controller_service_method: 'removingUserFromWhitelistCallback',
    },
  ],
  managingBotModalUserToConnect: [
    {
      modal_title: 'Connecting user to host',
      custom_id: CommandsModalComponents.INPUT_USER_TO_CONNECT,
      component_label: "User's to connect to host discord ID",
      component_placeholder: 'Enter discord ID',
      component_min_l: 18,
      component_max_l: 20,
      authenticated_guard_rule: 'isAuthenticated',
      role_guard_rules: ['Mentor', 'Calendar-bot-admin'],
      whitelisting_guard_rule: 'notWhitelisted',
      controller_service_method: 'connectingUserToMentorCallback',
    },
  ],
};

export type AppCommandModalComponent = {
  modal_title: string;
  custom_id: CommandsModalComponents;
  component_label: string;
  component_placeholder: string;
  component_min_l: number;
  component_max_l: number;
  authenticated_guard_rule: 'isAuthenticated' | 'notAuthenticated';
  role_guard_rules: ('Mentor' | 'Calendar-bot-admin')[]; // !!USE ROLE NAMES FROM DISCORD OR CHANGE NAMES IN THIS FILE! ROLE IDS ARE MANAGED BY THIS APP AND YOU DONT HAVE TO KNOW THEM!!
  whitelisting_guard_rule: 'isWhitelisted' | 'notWhitelisted';
  controller_service_method:
    | 'addingUserToWhitelistCallback'
    | 'removingUserFromWhitelistCallback'
    | 'connectingUserToMentorCallback';
};
