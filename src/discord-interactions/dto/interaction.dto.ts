import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { InteractionDataDTO } from './Interaction-data.dto';
import { InteractionMessageDTO } from './Interaction-message.dto';
import { DiscordUserDTO } from './Discord-user.dto';

class InteractionBaseDTO {
  type: number;
  token: string;
  id: string;
  data: {
    name?: string;
  };
}

export class MappedInteractionDTO {
  type: number;
  token: string;
  id: string;

  @ValidateNested()
  @Type(() => InteractionDataDTO)
  data: InteractionDataDTO;

  discord_usr: DiscordUserDTO;
  message: InteractionMessageDTO;
}

export class InteractionWUserDTO extends InteractionBaseDTO {
  member: undefined;
  user: DiscordUserDTO;
}

export class InteractionWMemberDTO extends InteractionBaseDTO {
  user: undefined;
  member: {
    user: DiscordUserDTO;
  };
}
