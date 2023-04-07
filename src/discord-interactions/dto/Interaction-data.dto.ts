import { ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { InteractionComponentDTO } from './Interaction-component.dto';

export class InteractionDataDTO {
  @IsOptional()
  name?: string;

  @IsOptional()
  custom_id?: string;

  @IsOptional()
  values?: string[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => InteractionComponentDTO)
  components?: InteractionComponentDTO[];
}
