import { Test, TestingModule } from '@nestjs/testing';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { UsersService } from '../users.service';
import { UsersTestSetup } from './users.spec-setup';
import { UsersRepository } from '../users.repository';
import { UsersServiceException } from '../../../users/exception/Users-service.exception';
import { AppUserDTO } from '../../../users/dto/App-user.dto';
import { DiscordApiService } from '../../../APIs/Discord-api.service';
import { DiscordUserDTO } from '../../../discord-interactions/dto/Discord-user.dto';
import * as nock from 'nock';
import axios from 'axios';
import { ConfigModule } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { HostCalendar } from '../../../Host-calendar/entity/Host-calendar.entity';

jest.mock('../../../Host-calendar/entity/Host-calendar.entity');
jest.mock('../users.repository');

const moduleMocker = new ModuleMocker(global);

describe('User service test suite:', () => {
  let setup: UsersTestSetup;
  let usersService: UsersService;
  let usersRepository: UsersRepository;

  beforeEach(async () => {
    jest.resetAllMocks();
    setup = new UsersTestSetup();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env', '.env.discord', '.env.authz', '.env.google'],
        }),
      ],
      providers: [UsersService],
    })
      .useMocker((token) => {
        if (token === UsersRepository) {
          return {
            getFirstUserByParam: jest.fn().mockResolvedValue(setup.mockUser1),
            createUser: jest.fn().mockResolvedValue(true),
            updateUser: jest.fn().mockResolvedValue(true),
            updateUserAuthStatus: jest.fn().mockResolvedValue(true),
            getAllUsers: jest
              .fn()
              .mockResolvedValue([setup.mockUser1, setup.mockUser2]),
            getWhitelistedUser: jest.fn().mockResolvedValue(setup.mockUser1),
            updateUserWhitelistStatus: jest.fn().mockResolvedValue(true),
            getAllWhitelistedUsers: jest
              .fn()
              .mockResolvedValue([setup.mockUser1, setup.mockUser2]),
            createOrUpdateAllUsers: jest.fn().mockResolvedValue(true),
            bindUsers: jest.fn().mockResolvedValue({ error: '' }),
          };
        }
        if (token === DiscordApiService) {
          return {
            axiosInstance: axios.create({
              baseURL: 'https://discord.com/api/v10',
              headers: {
                Authorization: `Bot 123`,
                'Content-Type': 'application/json; charset=UTF-8',
                'User-Agent':
                  'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)',
              },
            }),
          };
        }
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    usersService = await module.resolve<UsersService>(UsersService);
    usersRepository = await module.resolve<UsersRepository>(UsersRepository);
  });

  it('usersService should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('createUserIfNotExisting method test', () => {
    it('should return false coused by found user to create and not run usersRepository.createUser', async () => {
      const result: boolean = await usersService.createUserIfNotExisting(
        setup.user1Data,
      );

      const createSpy = jest.spyOn(usersRepository, 'createUser');

      expect(result).toEqual(false);
      expect(createSpy).toBeCalledTimes(0);
    });

    it('should run usersRepository.createUser 1 time and return true ', async () => {
      usersRepository.getFirstUserByParam = jest
        .fn()
        .mockResolvedValue(undefined);

      const createSpy = jest.spyOn(usersRepository, 'createUser');

      const result: boolean = await usersService.createUserIfNotExisting(
        setup.user1Data,
      );
      expect(result).toEqual(true);
      expect(createSpy).toBeCalledTimes(1);
    });

    it('should throw UsersServiceException', async () => {
      usersRepository.getFirstUserByParam = jest
        .fn()
        .mockRejectedValue(new Error());

      expect(async () => {
        await usersService.createUserIfNotExisting(setup.user1Data);
      }).rejects.toThrow(UsersServiceException);
    });
  });

  describe('updateUser method test', () => {
    it('should return true and run usersRepository.updateUser', async () => {
      const result: boolean = await usersService.updateUser(setup.mockUser1);

      const updateUserSpy = jest.spyOn(usersRepository, 'updateUser');

      expect(result).toEqual(true);
      expect(updateUserSpy).toBeCalledTimes(1);
    });
  });

  describe('updateUserAuthStatus method test', () => {
    it('should return true and run usersRepository.updateUserAuthStatus', async () => {
      const result: boolean = await usersService.updateUserAuthStatus(
        setup.mockUser1.dId,
        true,
      );

      const updateUserAuthSpy = jest.spyOn(
        usersRepository,
        'updateUserAuthStatus',
      );

      expect(result).toEqual(true);
      expect(updateUserAuthSpy).toBeCalledTimes(1);
    });
  });

  describe('getUserByDId method test', () => {
    it('should return mockedUserDTO and run usersRepository.getFirstUserByParam', async () => {
      const result: AppUserDTO | undefined = await usersService.getUserByDId(
        setup.mockUser1.dId,
      );

      const getFirstUserByParamSpy = jest.spyOn(
        usersRepository,
        'getFirstUserByParam',
      );

      expect(result).toEqual(setup.mockUser1);
      expect(getFirstUserByParamSpy).toBeCalledTimes(1);
    });

    it('should return undefined and run usersRepository.getFirstUserByParam', async () => {
      usersRepository.getFirstUserByParam = jest
        .fn()
        .mockResolvedValue(undefined);

      const result: AppUserDTO | undefined = await usersService.getUserByDId(
        setup.mockUser1.dId,
      );

      const getFirstUserByParamSpy = jest.spyOn(
        usersRepository,
        'getFirstUserByParam',
      );

      expect(result).toEqual(undefined);
      expect(getFirstUserByParamSpy).toBeCalledTimes(1);
    });
  });

  describe('checIfUserWhitelisted method test', () => {
    it('should return true and run usersRepository.getFirstUserByParam', async () => {
      const result: boolean = await usersService.checIfUserWhitelisted(
        setup.mockUser1.dId,
      );

      const getWhitelistedUserSpy = jest.spyOn(
        usersRepository,
        'getWhitelistedUser',
      );

      expect(result).toEqual(true);
      expect(getWhitelistedUserSpy).toBeCalledTimes(1);
    });

    it('should return false and run usersRepository.getFirstUserByParam', async () => {
      usersRepository.getWhitelistedUser = jest
        .fn()
        .mockResolvedValue(undefined);

      const result: boolean = await usersService.checIfUserWhitelisted(
        setup.mockUser1.dId,
      );

      const getWhitelistedUserSpy = jest.spyOn(
        usersRepository,
        'getWhitelistedUser',
      );

      expect(result).toEqual(false);
      expect(getWhitelistedUserSpy).toBeCalledTimes(1);
    });
  });

  describe('getWhitelistedUser method test', () => {
    it('should return AppUserDTO and run usersRepository.getWhitelistedUser', async () => {
      const result: AppUserDTO | undefined =
        await usersService.getWhitelistedUser(setup.mockUser1.dId);

      const getWhitelistedUserSpy = jest.spyOn(
        usersRepository,
        'getWhitelistedUser',
      );

      expect(result).toEqual(setup.mockUser1);
      expect(getWhitelistedUserSpy).toBeCalledTimes(1);
    });

    it('should return undefined and run usersRepository.getFirstUserByParam', async () => {
      usersRepository.getWhitelistedUser = jest
        .fn()
        .mockResolvedValue(undefined);

      const result: AppUserDTO | undefined =
        await usersService.getWhitelistedUser(setup.mockUser1.dId);

      const getWhitelistedUserSpy = jest.spyOn(
        usersRepository,
        'getWhitelistedUser',
      );

      expect(result).toEqual(undefined);
      expect(getWhitelistedUserSpy).toBeCalledTimes(1);
    });
  });

  describe('getUserFromDiscord method test', () => {
    it('should return DiscordUserDTO', async () => {
      nock('https://discord.com/api/v10')
        .get(`/guilds/${process.env.DISCORD_GUILD_ID}/members/123`)
        .reply(200, {
          user: setup.user1Data,
        });

      const result: DiscordUserDTO = await usersService.getUserFromDiscord(
        setup.mockUser1.dId,
      );

      expect(result).toEqual(setup.user1Data);
    });

    it('should throw NotFoundException due to not existing user', async () => {
      nock('https://discord.com/api/v10')
        .get(`/guilds/${process.env.DISCORD_GUILD_ID}/members/notExisting`)
        .reply(404);

      await expect(
        async () => await usersService.getUserFromDiscord('notExisting'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UsersServiceException due to unauthorized', async () => {
      nock('https://discord.com/api/v10')
        .get(`/guilds/${process.env.DISCORD_GUILD_ID}/members/123`)
        .reply(401, 'Unauthorized');

      await expect(
        async () => await usersService.getUserFromDiscord('123'),
      ).rejects.toThrow(UsersServiceException);
    });
  });

  describe('getUsersFromDiscord method test', () => {
    it('should return DiscordUserDTOs array', async () => {
      nock('https://discord.com/api/v10')
        .get(`/guilds/${process.env.DISCORD_GUILD_ID}/members?limit=1000`)
        .reply(200, [
          {
            roles: [],
            user: setup.user1Data,
          },
          {
            roles: [],
            user: setup.user2Data,
          },
        ]);

      const result: DiscordUserDTO[] = await usersService.getUsersFromDiscord();

      expect(result).toEqual([setup.user1Data, setup.user2Data]);
    });

    it('should throw UsersServiceException due to unauthorized', async () => {
      nock('https://discord.com/api/v10')
        .get(`/guilds/${process.env.DISCORD_GUILD_ID}/members?limit=1000`)
        .reply(401, 'Unauthorized');

      await expect(
        async () => await usersService.getUsersFromDiscord(),
      ).rejects.toThrow(UsersServiceException);
    });
  });

  describe('getFullAppUser method test', () => {
    it('should return AppUserDTO', async () => {
      const expectedResult: AppUserDTO = {
        ...setup.mockUser1,
        name: setup.user1AuthData.name,
        picture: setup.user1AuthData.picture,
        authenticated: true,
        IdP: setup.user1AuthData.sub.split('|')[0],
        aId: setup.user1AuthData.sub,
        email: setup.user1AuthData.email,
      };

      const result: AppUserDTO = usersService.getFullAppUser(
        setup.mockUser1,
        setup.user1AuthData,
      );

      expect(result).toEqual(expectedResult);
    });
  });

  describe('takeAndValidateUserAndHost method test', () => {
    it('should return object with AppUserDTO for user and host fields and error field popullated with text', async () => {
      const result: {
        user: AppUserDTO;
        host: AppUserDTO;
        error: string | undefined;
      } = await usersService.takeAndValidateUserAndHost({
        userDId: setup.mockUser1.dId,
        hostDId: setup.mockUser1.dId,
      });

      expect(result.user).toEqual(setup.mockUser1);
      expect(result.host).toEqual(setup.mockUser1);
      expect(result.error).toMatch(/.*\S.*/);
    });

    it('should return object with AppUserDTO for user and host fields and error field undefined', async () => {
      jest
        .spyOn(HostCalendar, 'findByPk')
        .mockResolvedValue(setup.getMockCalendar(setup.mockCalendarData));

      const result: {
        user: AppUserDTO;
        host: AppUserDTO;
        error: string | undefined;
      } = await usersService.takeAndValidateUserAndHost({
        userDId: setup.mockUser1.dId,
        hostDId: setup.mockUser1.dId,
      });

      expect(result.user).toEqual(setup.mockUser1);
      expect(result.host).toEqual(setup.mockUser1);
      expect(result.error).toBeUndefined();
    });

    it('should throw UsersServiceException', async () => {
      jest
        .spyOn(HostCalendar, 'findByPk')
        .mockRejectedValue(new Error('error'));

      expect(
        async () =>
          await usersService.takeAndValidateUserAndHost({
            userDId: setup.mockUser1.dId,
            hostDId: setup.mockUser1.dId,
          }),
      ).rejects.toThrow(UsersServiceException);
    });
  });

  describe('updateUserWhitelistStatus method test', () => {
    it('should return true and updateUserWhitelistStatus from usersRepository should be run 1 time', async () => {
      const updateUserWhitelistStatusSpy = jest.spyOn(
        usersRepository,
        'updateUserWhitelistStatus',
      );

      const result: boolean = await usersService.updateUserWhitelistStatus(
        setup.mockUser1.dId,
        true,
      );

      expect(result).toEqual(true);
      expect(updateUserWhitelistStatusSpy).toBeCalledTimes(1);
    });
  });

  describe('getAllUsers method test', () => {
    it('should return AppUserDTO array and getAllUsers from usersRepository should be run 1 time', async () => {
      const getAllUsersSpy = jest.spyOn(usersRepository, 'getAllUsers');

      const result: AppUserDTO[] = await usersService.getAllUsers();

      expect(result).toEqual([setup.mockUser1, setup.mockUser2]);
      expect(getAllUsersSpy).toBeCalledTimes(1);
    });
  });

  describe('getAllWhitelistedUsers method test', () => {
    it('should return AppUserDTO array and getAllWhitelistedUsers from usersRepository should be run 1 time', async () => {
      const getAllWhitelistedUsersSpy = jest.spyOn(
        usersRepository,
        'getAllWhitelistedUsers',
      );

      const result: AppUserDTO[] = await usersService.getAllWhitelistedUsers();

      expect(result).toEqual([setup.mockUser1, setup.mockUser2]);
      expect(getAllWhitelistedUsersSpy).toBeCalledTimes(1);
    });
  });

  describe('bindUsers method test', () => {
    it('should return object with error field which is empty string and run bindUsers from usersRepository', async () => {
      const bindUsersSpy = jest.spyOn(usersRepository, 'bindUsers');

      const result: { error: string } = await usersService.bindUsers(
        setup.mockUser1.dId,
        setup.mockUser2.dId,
      );

      expect(result).toEqual({ error: '' });
      expect(bindUsersSpy).toBeCalledTimes(1);
    });

    it('should return object with error field which is populated with text string and run bindUsers from usersRepository', async () => {
      const bindUsersSpy = jest
        .spyOn(usersRepository, 'bindUsers')
        .mockResolvedValue({
          error: 'error',
        });

      const result: { error: string } = await usersService.bindUsers(
        setup.mockUser1.dId,
        setup.mockUser2.dId,
      );

      expect(result).toEqual({ error: 'error' });
      expect(bindUsersSpy).toBeCalledTimes(1);
    });

    it('should throw UsersServiceException', async () => {
      jest
        .spyOn(usersRepository, 'bindUsers')
        .mockRejectedValue(new Error('error'));

      expect(
        async () =>
          await usersService.bindUsers(
            setup.mockUser1.dId,
            setup.mockUser2.dId,
          ),
      ).rejects.toThrow(UsersServiceException);
    });
  });
});
