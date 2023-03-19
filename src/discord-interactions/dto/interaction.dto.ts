import { UserDto } from '../../users/dto/user.dto';

class InteractionBase {
  type: number;
  token: string;
  id: string;
  data: {
    name: string;
  };
}

export class MappedInteraction {
  type: number;
  token: string;
  id: string;
  data: {
    name: string;
  };
  discord_usr: UserDto;
}

export class InteractionWUserDTO extends InteractionBase {
  member: undefined;
  user: UserDto;
}

export class InteractionWMemberDTO extends InteractionBase {
  user: undefined;
  member: {
    user: UserDto;
  };
}
