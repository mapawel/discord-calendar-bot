import { ValidateNested, IsOptional, Length } from 'class-validator';
import { Type } from 'class-transformer';

class InteractionNestedComponentDTO {
  @IsOptional()
  custom_id?: string;

  @IsOptional()
  type?: number;

  @IsOptional()
  @Length(18, 20)
  value?: string;
}

export class InteractionComponentDTO {
  @IsOptional()
  type?: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => InteractionNestedComponentDTO)
  components?: InteractionNestedComponentDTO[];
}
