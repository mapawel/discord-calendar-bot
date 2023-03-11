import { Injectable } from '@nestjs/common';
import { InteractionResponseType } from 'discord-interactions';

@Injectable()
export class CalendarBotService {
  responseWithPong() {
    return {
      type: InteractionResponseType.PONG,
    };
  }

  responseForMeeting() {
    // const button = {
    //   type: 2,
    //   style: 1,
    //   label: 'Click me!',
    //   custom_id: 'button-id',
    // };

    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Redirecting to the calendar...',
        // components: [
        //   {
        //     type: 1,
        //     components: [button],
        //   },
        // ],
      },
    };
  }
}
