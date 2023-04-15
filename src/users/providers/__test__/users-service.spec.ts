import { Test, TestingModule } from '@nestjs/testing';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { UsersService } from '../users.service';
import { UsersTestSetup } from './users.spec-setup';
import { UsersRepository } from '../users.repository';
import { UsersServiceException } from '../../../users/exception/Users-service.exception';
import { AppUserDTO } from '../../../users/dto/App-user.dto';
import { DiscordApiService } from '../../../APIs/Discord-api.service';
import { DiscordUserDTO } from '../../../discord-interactions/dto/Discord-user.dto';
import request, { Response } from 'supertest';

jest.mock('../users.repository');
const moduleMocker = new ModuleMocker(global);

describe('User service test suite:', () => {
  let setup: UsersTestSetup;
  let usersService: UsersService;
  let usersRepository: UsersRepository;
  let discordApiService: DiscordApiService;

  beforeEach(async () => {
    jest.resetAllMocks();
    setup = new UsersTestSetup();

    const module: TestingModule = await Test.createTestingModule({
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
            axiosInstance: jest.fn().mockResolvedValue({
              data: {
                user: setup.user1Data,
              },
              status: 200,
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
    discordApiService = await module.resolve<DiscordApiService>(
      DiscordApiService,
    );
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
    it('should return DiscordUserDTO and run usersRepository.getWhitelistedUser', async () => {
      const result: DiscordUserDTO | undefined =
        await usersService.getUserFromDiscord(setup.mockUser1.dId);

      const discordApiServiceSpy = jest.spyOn(
        discordApiService,
        'axiosInstance',
      );

      expect(result).toEqual(setup.user1Data);
      expect(discordApiServiceSpy).toBeCalledTimes(1);
    });

    // it('should ', async () => {

    //   await expect(
    //     async () => await usersService.getUserFromDiscord(setup.mockUser1.dId),
    //   ).rejects.toThrow(UsersServiceException);
    // });
  });
});
