import { Sequelize } from 'sequelize-typescript';
import { User } from '../../users/entity/User.entity';
import { Role } from '../../roles/entity/Role.entity';
import { WhitelistedUser } from '../../user-management/entities/whitelisted-user.entity';
import { MentorUser } from 'src/user-management/entities/mentor-user.entity';
import { WhitelistedUserMentor } from 'src/user-management/entities/whitelisted-user-mentor.entity';
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
        User,
        Role,
        WhitelistedUser,
        MentorUser,
        WhitelistedUserMentor,
      ]);
      await sequelize.sync();
      return sequelize;
    },
  },
];
