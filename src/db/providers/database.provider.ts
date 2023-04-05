import { join } from 'path';
import { Sequelize } from 'sequelize-typescript';
import { Role } from '../../roles/entity/Role.entity';
import { AppUser } from 'src/users/entity/App-user.entity';
import { AppUsersRelated } from 'src/users/entity/App-users-related.entity';
import { Calendar } from '../../Calendar/entity/Calendar.entity';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: join(
          process.cwd(),
          process.env.DB_FOLDER || 'db',
          process.env.DB_FILENAME || 'db.sqlite',
        ),
      });
      sequelize.addModels([Role, AppUser, AppUsersRelated, Calendar]);
      await sequelize.sync();
      return sequelize;
    },
  },
];
