import { UserDTO } from 'src/user-management/dto/User.dto';

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
  discord_usr: UserDTO;
}

export class InteractionWUserDTO extends InteractionBase {
  member: undefined;
  user: UserDTO;
}

export class InteractionWMemberDTO extends InteractionBase {
  user: undefined;
  member: {
    user: UserDTO;
  };
}
