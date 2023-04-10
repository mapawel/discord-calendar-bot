import { DiscordUserDTO } from '../dto/Discord-user.dto';
import { InteractionComponentDTO } from '../dto/Interaction-component.dto';
import { InteractionMessageDTO } from '../dto/Interaction-message.dto';

export type InteractionBodyFieldsType = {
  discordUser: DiscordUserDTO;
  values: string[];
  token: string;
  custom_id: string;
  id: string;
  components: InteractionComponentDTO[];
  message: InteractionMessageDTO;
};
