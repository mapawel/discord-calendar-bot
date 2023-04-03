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
      authenticated_guard_rule: 'isAuthenticated',
      role_guard_rules: ['Mentor', 'Calendar-bot-admin'], // !!USE ROLE NAMES FROM DISCORD OR CHANGE NAMES IN THIS FILE! ROLE IDS ARE MANAGED BY THIS APP AND YOU DONT HAVE TO KNOW THEM!!
      whitelisting_guard_rule: 'notWhitelisted',
      controller_service_method: 'addingUserToWhitelistCallback',
    },
  ],
  // managingBotSelectRemoving: [
  //   {
  //   },
  // ],
  // managingBotSelectUserToConnect: [
  //   {
  // ],
};

export type AppCommandModalComponent = {
  modal_title: string;
  custom_id: CommandsModalComponents;
  component_label: string;
  component_placeholder: string;
  authenticated_guard_rule: 'isAuthenticated' | 'notAuthenticated';
  role_guard_rules: ('Mentor' | 'Calendar-bot-admin')[]; // !!USE ROLE NAMES FROM DISCORD OR CHANGE NAMES IN THIS FILE! ROLE IDS ARE MANAGED BY THIS APP AND YOU DONT HAVE TO KNOW THEM!!
  whitelisting_guard_rule: 'isWhitelisted' | 'notWhitelisted';
  controller_service_method: 'addingUserToWhitelistCallback';
};

// data: {
//   type: 9,
//   data:

// {
//     title: 'My Cool Modal',
//     custom_id: 'cool_modal',
//     components: [
//       {
//         type: 1,
//         components: [
//           {
//             type: 4,
//             custom_id: 'name',
//             label: 'Name',
//             style: 1,
//             min_length: 1,
//             max_length: 4000,
//             placeholder: 'John',
//             required: true,
//           },
//         ],
//       },
//     ],
//   },

// },
