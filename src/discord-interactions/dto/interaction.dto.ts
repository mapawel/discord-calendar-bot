import { DiscordUserDTO } from './Discord-user.dto';
import { ValidateNested, IsOptional, Length } from 'class-validator';
import { Type } from 'class-transformer';

class InnerComponent {
  @IsOptional()
  custom_id?: string;

  @IsOptional()
  type?: number;

  @IsOptional()
  @Length(18, 20)
  value?: number;
}

class OuterComponent {
  @IsOptional()
  type?: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => InnerComponent)
  components?: InnerComponent[];
}

class Data {
  @IsOptional()
  name?: string;

  @IsOptional()
  custom_id?: string;

  @IsOptional()
  values?: string[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OuterComponent)
  components?: OuterComponent[];
}

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

  @ValidateNested()
  @Type(() => Data)
  data: Data;
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
