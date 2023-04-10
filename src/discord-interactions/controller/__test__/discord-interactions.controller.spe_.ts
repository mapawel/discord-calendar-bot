import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DiscordInteractionController } from '../discord-interactions.controller';
import { InteractionService } from '../../service/interactions.service';
import { IntegrationSlashCommandsService } from '../../service/subservices/interactions-slash-commands.service';
import { InteractionsGetMeetingService } from '../../service/subservices/interactions-get-meeting.service';
import { InteractionsBotManagingService } from '../../service/subservices/interactions-bot-managing.service';
import { ResponseComponentsProvider } from '../../service/response-components.provider';
import { RolesModule } from '../../../roles/roles.module';
import { UsersModule } from '../../../users/users.module';
import { ApisModule } from '../../../APIs/APIs.module';
import { HostCalendarModule } from '../../../Host-calendar/Host-calendar.module';
import { AuthenticatedGuardService } from '../../../guards/guard-services/authentcated-guard.service';
import { RolesGuardService } from '../../../guards/guard-services/roles-guard.service';
import { WhitelistGuardService } from '../../../guards/guard-services/whitelist-guard.service';

// in progress...

describe('Discord Interaction Controller test suite:', () => {
  let controller: DiscordInteractionController;
  let interactionService: InteractionService;
  let interactionSlshCommandsService: IntegrationSlashCommandsService;
  let interactionsGetMeetingService: InteractionsGetMeetingService;
  let interactionsBotManagingService: InteractionsBotManagingService;
  let responseComponentsProvider: ResponseComponentsProvider;

  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RolesModule, UsersModule, ApisModule, HostCalendarModule],
      controllers: [DiscordInteractionController],
      providers: [
        IntegrationSlashCommandsService,
        InteractionService,
        AuthenticatedGuardService,
        RolesGuardService,
        WhitelistGuardService,
        ResponseComponentsProvider,
        InteractionsGetMeetingService,
        InteractionsBotManagingService,
      ],
    }).compile();

    controller = module.get<DiscordInteractionController>(InteractionService);
    interactionService = await module.resolve<InteractionService>(
      InteractionService,
    );

    app = module.createNestApplication();
    await app.init();
  });

  // afterAll(async () => {
  // });

  it('Controller should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('InteractionService should be defined', () => {
    expect(interactionService).toBeDefined();
  });

  // it('/animals/all (GET)', async () => {
  //   const serviceFindAllspy = jest
  //     .spyOn(animalsService, 'findAll')
  //     .mockImplementation(async () => [setup.animal1, setup.animal2]);

  //   //when
  //   const response: request.Response = await request(app.getHttpServer()).get(
  //     '/animals/all',
  //   );
  //   //then
  //   expect(serviceFindAllspy).toBeCalledTimes(1);
  //   expect(setup.sortAnimalsById(response.body)).toEqual(
  //     setup.sortAnimalsById([setup.animal1ResDTO, setup.animal2ResDTO]),
  //   );
  // });
});
