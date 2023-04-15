import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from '../users.repository';
import { AppUser } from '../../entity/App-user.entity';
import { AppUserDTO } from '../../dto/App-user.dto';
import { AppUserMapper } from '../../dto/App-user.mapper';
import { DiscordUserDTO } from '../../../discord-interactions/dto/Discord-user.dto';
import { DBException } from '../../../db/exception/DB.exception';
import { AppUsersRelated } from '../../entity/App-users-related.entity';
import { UsersTestSetup } from './users.spec-setup';
import { NotFoundException } from '@nestjs/common';

jest.mock('../../entity/App-user.entity');
jest.mock('../../entity/App-users-related.entity');

describe('User repository test suite:', () => {
  let setup: UsersTestSetup;
  let usersRepository: UsersRepository;

  beforeEach(async () => {
    setup = new UsersTestSetup();
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersRepository],
    }).compile();

    usersRepository = await module.resolve<UsersRepository>(UsersRepository);
  });

  it('userRepository should be defined', () => {
    expect(usersRepository).toBeDefined();
  });

  describe('getFirstUserByParam method test', () => {
    it('should run findOne 1 time and return user data in shape of AppUserDTO', async () => {
      const mockedAppUser: AppUser = setup.getMockUser(setup.mockUser1);

      const findOneSpy = jest
        .spyOn(AppUser, 'findOne')
        .mockResolvedValue(mockedAppUser);

      const result = await usersRepository.getFirstUserByParam('dId', '123');

      expect(findOneSpy).toBeCalledTimes(1);
      expect(result).toEqual(AppUserMapper(mockedAppUser));
    });

    it('should run findOne 1 time return undefined', async () => {
      const findOneSpy = jest.spyOn(AppUser, 'findOne').mockResolvedValue(null);

      const result = await usersRepository.getFirstUserByParam('dId', '123');

      expect(findOneSpy).toBeCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should throw DBException on DB entity reject', async () => {
      jest.spyOn(AppUser, 'findOne').mockRejectedValue(new Error());

      await expect(
        async () => await usersRepository.getFirstUserByParam('dId', '123'),
      ).rejects.toThrow(DBException);
    });
  });

  describe('createUser method test', () => {
    it('should run create method with passed params and return true', async () => {
      const userData: DiscordUserDTO = setup.user1Data;

      const createSpy = jest.spyOn(AppUser, 'create').mockResolvedValue(true);

      const result: true = await usersRepository.createUser(userData);

      expect(createSpy).toBeCalledWith({
        dId: userData.id,
        username: userData.username,
      });
      expect(result).toEqual(true);
    });

    it('should throw DBException on DB entity reject', async () => {
      const userData: DiscordUserDTO = setup.user1Data;

      jest.spyOn(AppUser, 'create').mockRejectedValue(new Error());

      await expect(
        async () => await usersRepository.createUser(userData),
      ).rejects.toThrow(DBException);
    });
  });

  describe('updateUser method test', () => {
    it('should run update method with passed object and return true', async () => {
      const userData: AppUserDTO = setup.mockUser1;

      const updateSpy = jest.spyOn(AppUser, 'update').mockResolvedValue([1]);

      const result: true = await usersRepository.updateUser(userData);

      expect(updateSpy).toBeCalledWith(
        {
          aId: userData.aId,
          username: userData.username,
          email: userData.email,
          authenticated: userData.authenticated,
          IdP: userData.IdP,
          whitelisted: userData.whitelisted,
          name: userData.name,
          picture: userData.picture,
        },
        { where: { dId: userData.dId } },
      );
      expect(result).toEqual(true);
    });

    it('should throw DBException on DB entity reject', async () => {
      const userData: AppUserDTO = setup.mockUser1;

      jest.spyOn(AppUser, 'update').mockRejectedValue(new Error());

      await expect(
        async () => await usersRepository.updateUser(userData),
      ).rejects.toThrow(DBException);
    });
  });

  describe('updateUserAuthStatus method test', () => {
    it('should run update method with passed authenticated status and return true', async () => {
      const dIdToUpdate = '123';
      const authenticatedToUpdate = true;

      const updateSpy = jest.spyOn(AppUser, 'update').mockResolvedValue([1]);

      const result: true = await usersRepository.updateUserAuthStatus(
        dIdToUpdate,
        authenticatedToUpdate,
      );

      expect(updateSpy).toBeCalledWith(
        {
          authenticated: authenticatedToUpdate,
        },
        { where: { dId: dIdToUpdate } },
      );
      expect(result).toEqual(true);
    });

    it('should throw DBException on DB entity reject', async () => {
      const dIdToUpdate = '123';
      const authenticatedToUpdate = true;

      jest.spyOn(AppUser, 'update').mockRejectedValue(new Error());

      await expect(
        async () =>
          await usersRepository.updateUserAuthStatus(
            dIdToUpdate,
            authenticatedToUpdate,
          ),
      ).rejects.toThrow(DBException);
    });
  });

  describe('getAllUsers method test', () => {
    it('should run findAll 1 time and return AppUserDTO[]', async () => {
      const mockUsers: AppUser[] = [
        setup.getMockUser(setup.mockUser1),
        setup.getMockUser(setup.mockUser2),
      ];
      const mockUsersDTO: AppUserDTO[] = [setup.mockUser1, setup.mockUser2];

      const findAllSpy = jest
        .spyOn(AppUser, 'findAll')
        .mockResolvedValue(mockUsers);

      const result: AppUserDTO[] = await usersRepository.getAllUsers();

      expect(findAllSpy).toBeCalledTimes(1);
      expect(result).toEqual(mockUsersDTO);
    });

    it('should throw DBException on DB entity reject', async () => {
      jest.spyOn(AppUser, 'findAll').mockRejectedValue(new Error());

      await expect(
        async () => await usersRepository.getAllUsers(),
      ).rejects.toThrow(DBException);
    });
  });

  describe('getWhitelistedUser method test', () => {
    it('should run findOne 1 time and return AppUserDTO', async () => {
      const mockUser: AppUser = setup.getMockUser(setup.mockUser1);
      const mockUserDTO: AppUserDTO = setup.mockUser1;

      const findOneSpy = jest
        .spyOn(AppUser, 'findOne')
        .mockResolvedValue(mockUser);

      const result: AppUserDTO | undefined =
        await usersRepository.getWhitelistedUser(mockUserDTO.dId);

      expect(findOneSpy).toBeCalledTimes(1);
      expect(result).toEqual(mockUserDTO);
    });

    it('should throw DBException on DB entity reject', async () => {
      const mockUserDTO: AppUserDTO = setup.mockUser1;

      jest.spyOn(AppUser, 'findOne').mockRejectedValue(new Error());

      await expect(
        async () => await usersRepository.getWhitelistedUser(mockUserDTO.dId),
      ).rejects.toThrow(DBException);
    });
  });

  describe('updateUserWhitelistStatus method test', () => {
    it('should run update with passed object and return true', async () => {
      const dIdToUpdate = '123';
      const whitelistedToUpdate = true;

      const updateSpy = jest.spyOn(AppUser, 'update').mockResolvedValue([1]);

      const result: true = await usersRepository.updateUserWhitelistStatus(
        dIdToUpdate,
        whitelistedToUpdate,
      );

      expect(updateSpy).toBeCalledWith(
        {
          whitelisted: whitelistedToUpdate,
        },
        { where: { dId: dIdToUpdate } },
      );
      expect(result).toEqual(true);
    });

    it('should throw NotFoundException while the user not found', async () => {
      const dIdToUpdate = 'notExisting';
      const whitelistedToUpdate = true;

      jest.spyOn(AppUser, 'update').mockResolvedValue([0]);

      await expect(
        async () =>
          await usersRepository.updateUserWhitelistStatus(
            dIdToUpdate,
            whitelistedToUpdate,
          ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw DBException on DB entity reject', async () => {
      const dIdToUpdate = 'notExisting';
      const whitelistedToUpdate = true;

      jest.spyOn(AppUser, 'update').mockRejectedValue(new Error());

      await expect(
        async () =>
          await usersRepository.updateUserWhitelistStatus(
            dIdToUpdate,
            whitelistedToUpdate,
          ),
      ).rejects.toThrow(DBException);
    });
  });

  describe('getAllWhitelistedUsers method test', () => {
    it('should run findAll 1 time and return array of AppUserDTO', async () => {
      const mockUsers: AppUser[] = [
        setup.getMockUser(setup.mockUser1),
        setup.getMockUser(setup.mockUser2),
      ];
      const mockUsersDTO: AppUserDTO[] = [setup.mockUser1, setup.mockUser2];

      const findAllSpy = jest
        .spyOn(AppUser, 'findAll')
        .mockResolvedValue(mockUsers);

      const result: AppUserDTO[] =
        await usersRepository.getAllWhitelistedUsers();

      expect(findAllSpy).toBeCalledTimes(1);
      expect(result).toEqual(mockUsersDTO);
    });

    it('should throw DBException on DB entity reject', async () => {
      jest.spyOn(AppUser, 'findAll').mockRejectedValue(new Error());

      await expect(
        async () => await usersRepository.getAllWhitelistedUsers(),
      ).rejects.toThrow(DBException);
    });
  });

  describe('createOrUpdateAllUsers method test', () => {
    it('should run findAll 1 time and return array of AppUserDTO', async () => {
      const mockUsers: AppUser[] = [
        setup.getMockUser(setup.mockUser1),
        setup.getMockUser(setup.mockUser2),
      ];
      const mockUsersDTO: AppUserDTO[] = [setup.mockUser1, setup.mockUser2];

      const findAllSpy = jest
        .spyOn(AppUser, 'findAll')
        .mockResolvedValue(mockUsers);

      const result: AppUserDTO[] =
        await usersRepository.getAllWhitelistedUsers();

      expect(findAllSpy).toBeCalledTimes(1);
      expect(result).toEqual(mockUsersDTO);
    });

    it('should throw DBException on DB entity reject', async () => {
      jest.spyOn(AppUser, 'findAll').mockRejectedValue(new Error());

      await expect(
        async () => await usersRepository.getAllWhitelistedUsers(),
      ).rejects.toThrow(DBException);
    });
  });

  describe('createOrUpdateAllUsers method test', () => {
    it('should run findAll, bulkCreate, destroy 1 time each and return array of AppUserDTO', async () => {
      const mockDiscordUsers: DiscordUserDTO[] = [
        setup.user1Data,
        setup.user2Data,
      ];

      const findAllSpy = jest
        .spyOn(AppUser, 'findAll')
        .mockResolvedValue([setup.getMockUser(setup.mockUser1)]);
      const bulkCreateSpy = jest
        .spyOn(AppUser, 'bulkCreate')
        .mockResolvedValue([]);
      const destroySpy = jest.spyOn(AppUser, 'destroy').mockResolvedValue(1);

      await usersRepository.createOrUpdateAllUsers(mockDiscordUsers);

      expect(findAllSpy).toBeCalledTimes(1);
      expect(bulkCreateSpy).toBeCalledTimes(1);
      expect(destroySpy).toBeCalledTimes(1);
    });
  });

  describe('bindUsers method test', () => {
    it('should run getFirstUserByParam 2 times and AppUsersRelated create 1 time return array of AppUserDTO', async () => {
      const getFirstUserByParamSpy = jest
        .spyOn(UsersRepository.prototype, 'getFirstUserByParam')
        .mockResolvedValue(setup.mockUser1);
      const findOneSpy = jest
        .spyOn(AppUsersRelated, 'findOne')
        .mockResolvedValue(null);
      const createSpy = jest
        .spyOn(AppUsersRelated, 'create')
        .mockResolvedValue(null);

      await usersRepository.bindUsers(setup.mockUser1.dId, setup.mockUser2.dId);

      expect(getFirstUserByParamSpy).toBeCalledTimes(2);
      expect(findOneSpy).toBeCalledTimes(1);
      expect(createSpy).toBeCalledTimes(1);
    });

    it('should run getFirstUserByParam 2 times and AppUsersRelated update 1 time return array of AppUserDTO', async () => {
      let updateSpy;

      const getFirstUserByParamSpy = jest
        .spyOn(UsersRepository.prototype, 'getFirstUserByParam')
        .mockResolvedValue(setup.mockUser1);

      const findOneSpy = jest
        .spyOn(AppUsersRelated, 'findOne')
        .mockResolvedValue(
          Object.assign(new AppUsersRelated(), {
            id: 1,
            sourceUserId: '123',
            targetUserId: '456',
          }),
        );

      const found = await AppUsersRelated.findOne({
        where: {
          sourceUserId: '123',
          targetUserId: '456',
        },
      });

      if (found) {
        updateSpy = jest
          .spyOn(found, 'update')
          .mockResolvedValue(new AppUsersRelated());
      } else {
        updateSpy = jest.fn(() => null);
      }

      await usersRepository.bindUsers(setup.mockUser1.dId, setup.mockUser2.dId);

      expect(getFirstUserByParamSpy).toBeCalledTimes(2);
      expect(findOneSpy).toBeCalledTimes(2);
      expect(updateSpy).toBeCalledTimes(1);
    });

    it('should return DBException due to sourceUser not found', async () => {
      jest
        .spyOn(UsersRepository.prototype, 'getFirstUserByParam')
        .mockResolvedValue(undefined);

      expect(async () => {
        await usersRepository.bindUsers(
          setup.mockUser1.dId,
          setup.mockUser2.dId,
        );
      }).rejects.toThrow(DBException);
    });

    it('should return DBException due to max mentors reached by user', async () => {
      const getFirstUserByParamSpy = jest
        .spyOn(UsersRepository.prototype, 'getFirstUserByParam')
        .mockResolvedValue(setup.mockUser3);

      const result: { error: string } = await usersRepository.bindUsers(
        setup.mockUser1.dId,
        setup.mockUser2.dId,
        3,
      );

      expect(getFirstUserByParamSpy).toBeCalledTimes(2);
      expect(result.error).toEqual('Max mentors reached');
    });
  });
});
