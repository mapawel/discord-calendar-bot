import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from '../users.repository';
import { AppUser } from '../../entity/App-user.entity';
import { AppUserDTO } from '../../dto/App-user.dto';
import { AppUserMapper } from '../../dto/App-user.mapper';
import { DiscordUserDTO } from '../../../discord-interactions/dto/Discord-user.dto';
import { DBException } from '../../../db/exception/DB.exception';
import { AppUsersRelated } from '../../entity/App-users-related.entity';
import { UsersRepositoryTestSetup } from './users-repositury.spec-setup';

jest.mock('../../entity/App-user.entity');

describe('User repository test suite:', () => {
  let setup: UsersRepositoryTestSetup;
  let usersRepository: UsersRepository;

  beforeEach(async () => {
    setup = new UsersRepositoryTestSetup();
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
    it('should return user data in shape of AppUserDTO', async () => {
      const mockedAppUser: AppUser = setup.getMockUser1();

      const AppUserFindOneSpy = jest
        .spyOn(AppUser, 'findOne')
        .mockResolvedValue(mockedAppUser);

      const result = await usersRepository.getFirstUserByParam('dId', '123');

      expect(AppUserFindOneSpy).toBeCalledTimes(1);
      expect(result).toEqual(AppUserMapper(mockedAppUser));
    });

    it('should return undefined', async () => {
      const AppUserFindOneSpy = jest
        .spyOn(AppUser, 'findOne')
        .mockResolvedValue(null);

      const result = await usersRepository.getFirstUserByParam('dId', '123');

      expect(AppUserFindOneSpy).toBeCalledTimes(1);
      expect(result).toBeUndefined();
    });
  });
});
