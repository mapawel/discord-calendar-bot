import { InteractionResponseType } from 'discord-interactions';
import { AppAllCommandComponentsType } from '../../app-SETUP/lists/types/App-all-types-component.type';

type InteractionResponseComponentBase = {
  id: string;
  token: string;
  type:
    | InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE
    | InteractionResponseType.UPDATE_MESSAGE;
  content?: string;
};

export type InteractionResponseMultilineArgs =
  InteractionResponseComponentBase & {
    componentsArrays?: AppAllCommandComponentsType[][];
    embed?: { title: string; fields: { name: string; value: string }[] };
  };

export type InteractionResponseArgs = InteractionResponseComponentBase & {
  components?: AppAllCommandComponentsType[];
  embed?: { title: string; fields: { name: string; value: string }[] };
};
