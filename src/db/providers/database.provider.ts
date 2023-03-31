import { join } from 'path';
import { Sequelize } from 'sequelize-typescript';
import { Role } from '../../roles/entity/Role.entity';
import { AppUser } from 'src/users/entity/App-user.entity';
import { AppUsersRelated } from 'src/users/entity/App-users-related.entity';
import { Calendar } from '../../discord-interactions/Calendar-service/entity/Calendar.entity';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: join(process.cwd(), 'db', 'test.sqlite'),
      });
      sequelize.addModels([Role, AppUser, AppUsersRelated, Calendar]);
      await sequelize.sync();
      return sequelize;
    },
  },
];
