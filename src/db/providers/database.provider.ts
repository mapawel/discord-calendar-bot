import { join } from 'path';
import { Sequelize } from 'sequelize-typescript';
import { Role } from '../../roles/entity/Role.entity';
import { AppUser } from 'src/users/entity/App-user.entity';
import { AppUsersRelated } from 'src/users/entity/App-users-related.entity';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: join(process.cwd(), 'db', 'test.sqlite'),
      });
      sequelize.addModels([Role, AppUser, AppUsersRelated]);
      await sequelize.sync();
      return sequelize;
    },
  },
];
