import { InteractionEmbedFieldDTO } from './Interaction-embed-field.dto';

export class InteractionMessageDTO {
  embeds: {
    fields: InteractionEmbedFieldDTO[];
  }[];
}
