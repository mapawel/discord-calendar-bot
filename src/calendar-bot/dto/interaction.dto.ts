import { UserDto } from './user.dto';

class InteractionBase {
  type: number;
  token: string;
  id: string;
  data: {
    name: string;
  };
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
