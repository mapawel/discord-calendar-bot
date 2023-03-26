import { DiscordUserDTO } from './Discord-user.dto';

class InteractionBase {
  type: number;
  token: string;
  id: string;
  data: {
    name?: string;
  };
}

export class MappedInteraction {
  type: number;
  token: string;
  id: string;
  data: {
    name?: string;
    custom_id?: string;
    values?: string[];
  };
  discord_usr: DiscordUserDTO;
}

export class InteractionWUserDTO extends InteractionBase {
  member: undefined;
  user: DiscordUserDTO;
}

export class InteractionWMemberDTO extends InteractionBase {
  user: undefined;
  member: {
    user: DiscordUserDTO;
  };
}
