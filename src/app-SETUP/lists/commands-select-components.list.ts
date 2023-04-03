import { CommandsSelectComponents } from '../enums/commands-select-components.enum';

export const commandsSelectComponents: Record<
  string,
  AppCommandSelectComponent[]
> = {
  // managingBotSelectAdding: [
  //   {
  //     type: 3,
  //     custom_id: CommandsSelectComponents.SELECT_USER_TO_ADD,
  //     options: [
  //       {
  //         label: 'to replace in app code',
  //         value: 'to replace in app code',
  //         description: 'to replace in app code',
  //       },
  //     ],
  //     placeholder: 'discord user',
  //     min_value: 1,
  //     max_value: 1,
  //     authenticated_guard_rule: 'isAuthenticated',
  //     role_guard_rules: ['Calendar-bot-admin', 'Mentor'],
  //     whitelisting_guard_rule: 'notWhitelisted',

  //     controller_service_method: 'addingUserToWhitelistCallback',
  //   },
  // ],
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
  meetingDetailsTopics: [
    {
      type: 3,
      custom_id: CommandsSelectComponents.MEETING_DETAILS_TOPIC,
      options: [
        {
          label: 'Fast code check by mentor',
          value: 'code-check',
          description: 'Ask mentor to leave feedback as to you code.',
        },
        {
          label: 'Regular Code Review',
          value: 'code-review',
          description: 'Ask for a code review.',
        },
        {
          label: 'General help',
          value: 'general-help',
          description: 'Ask about issues not related to your code.',
        },
        {
          label: 'My CV and job search',
          value: 'career',
          description: 'Ask about issues connected to your career.',
        },
      ],
      placeholder: 'topic...',
      min_value: 1,
      max_value: 1,
      authenticated_guard_rule: 'isAuthenticated',
      role_guard_rules: [],
      whitelisting_guard_rule: 'isWhitelisted',
      controller_service_method: 'meetingDetailsTopicCallback',
    },
  ],
  meetingDetailsDuration: [
    {
      type: 3,
      custom_id: CommandsSelectComponents.MEETING_DETAILS_DURATION,
      options: [
        {
          label: '15 minutes',
          value: 15 * 60 * 1000,
          description: 'Just fast, small issues...',
        },
        {
          label: '30 minutes',
          value: 30 * 60 * 1000,
          description: 'Usuly one topic.',
        },
        {
          label: '1 hour',
          value: 60 * 60 * 1000,
          description: 'Wide range of topics.',
        },
      ],
      placeholder: 'duration...',
      min_value: 1,
      max_value: 1,
      authenticated_guard_rule: 'isAuthenticated',
      role_guard_rules: [],
      whitelisting_guard_rule: 'isWhitelisted',
      controller_service_method: 'meetingDetailsDurationCallback',
    },
  ],
  meetingDetailsTime: [
    {
      type: 3,
      custom_id: CommandsSelectComponents.MEETING_DETAILS_TIME,
      options: [
        {
          label: 'to replace in app code',
          value: 'to replace in app code',
          description: 'to replace in app code',
        },
      ],
      placeholder: 'free hours...',
      min_value: 1,
      max_value: 1,
      authenticated_guard_rule: 'isAuthenticated',
      role_guard_rules: [],
      whitelisting_guard_rule: 'isWhitelisted',
      controller_service_method: 'meetingDetailsTimeCallback',
    },
  ],
};

export type AppCommandSelectComponent = {
  type: 3;
  options: { value: string | number; label: string; description: string }[];
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
    | 'connectingUserToMentorCallback2'
    | 'meetingDetailsTopicCallback'
    | 'meetingDetailsDurationCallback'
    | 'meetingDetailsTimeCallback';
};
