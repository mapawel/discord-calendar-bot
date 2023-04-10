import { AppUser } from '../../entity/App-user.entity';
import { AppUserDTO } from '../../dto/App-user.dto';
import { AppUserMapper } from '../../dto/App-user.mapper';
import { DiscordUserDTO } from '../../../discord-interactions/dto/Discord-user.dto';

export class UsersRepositoryTestSetup {
  private mockUser1 = {
    dId: '123',
    aId: 'testAid',
    username: 'testUsername',
    email: 'test@email.com',
    authenticated: 1,
    IdP: 'testIdp',
    whitelisted: 1,
    name: 'testName',
    picture: 'https://testPictureLink.jpg',
    updatedAt: Date.now(),
    mentors: [
      {
        dId: '456',
        username: 'metorUsername',
      },
    ],
  };

  public getMockUser1(): AppUser {
    const mockedAppUser: AppUser = new AppUser();
    Object.assign(mockedAppUser, this.mockUser1);
    return mockedAppUser;
  }
}
