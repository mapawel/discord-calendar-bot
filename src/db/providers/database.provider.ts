import { Sequelize } from 'sequelize-typescript';
import { UserWithAuth } from '../../users/entity/User-with-auth.entity';
import { Role } from '../../roles/entity/Role.entity';
import { WhitelistedUser } from '../../user-management/entities/Whitelisted-user.entity';
import { Mentor } from '../../user-management/entities/Mentor.entity';
import { WhitelistedUserMentor } from '../../user-management/entities/Whitelisted-user-mentor.entity';
import { join } from 'path';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: join(process.cwd(), 'db', 'test.sqlite'),
      });
      sequelize.addModels([
        UserWithAuth,
        Role,
        WhitelistedUser,
        Mentor,
        WhitelistedUserMentor,
      ]);
      await sequelize.sync();
      return sequelize;
    },
  },
];
