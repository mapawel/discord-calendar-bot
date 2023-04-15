import { AppUser } from '../../entity/App-user.entity';
import { AppUserDTO } from '../../dto/App-user.dto';

export class UsersTestSetup {
  public mockUser1 = {
    dId: '123',
    aId: 'testAid',
    username: 'testUsername',
    email: 'test@email.com',
    authenticated: true,
    IdP: 'testIdp',
    whitelisted: true,
    name: 'testName',
    picture: 'https://testPictureLink.jpg',
    updatedAt: new Date(Date.now()),
    mentors: [
      {
        dId: '456',
        username: 'metorUsername',
      },
    ],
  };

  public mockUser2 = {
    dId: '456',
    aId: 'testAid2',
    username: 'testUsername2',
    email: 'test2@email.com',
    authenticated: true,
    IdP: 'testIdp2',
    whitelisted: true,
    name: 'testName2',
    picture: 'https://testPictureLink2.jpg',
    updatedAt: new Date(Date.now()),
    mentors: [
      {
        dId: '123',
        username: 'metorUsername2',
      },
    ],
  };

  public mockUser3 = {
    dId: '789',
    aId: 'testAid3',
    username: 'testUsername3',
    email: 'test2@email.com',
    authenticated: true,
    IdP: 'testIdp3',
    whitelisted: true,
    name: 'testName3',
    picture: 'https://testPictureLink3.jpg',
    updatedAt: new Date(Date.now()),
    mentors: [
      {
        dId: '123a',
        username: 'metorUsername1',
      },
      {
        dId: '123b',
        username: 'metorUsername2',
      },
      {
        dId: '123c',
        username: 'metorUsername3',
      },
      {
        dId: '123d',
        username: 'metorUsername4',
      },
      {
        dId: '123e',
        username: 'metorUsername5',
      },
    ],
  };

  public user1Data = {
    id: '123',
    username: 'testUsername',
  };

  public user2Data = {
    id: '456',
    username: 'testUsername2',
  };

  public getMockUser(user: AppUserDTO): AppUser {
    const mockedAppUser: AppUser = new AppUser();
    Object.assign(mockedAppUser, user);
    return mockedAppUser;
  }
}
