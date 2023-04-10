import { join } from 'path';
import { Sequelize } from 'sequelize-typescript';
import { Role } from '../../roles/entity/Role.entity';
import { AppUser } from '../../users/entity/App-user.entity';
import { AppUsersRelated } from '../../users/entity/App-users-related.entity';
import { HostCalendar } from '../../Host-calendar/entity/Host-calendar.entity';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        logging: false,
        dialect: 'sqlite',
        storage: join(
          process.cwd(),
          process.env.DB_FOLDER || 'db',
          process.env.DB_FILENAME || 'db.sqlite',
        ),
      });
      sequelize.addModels([Role, AppUser, AppUsersRelated, HostCalendar]);
      await sequelize.sync();
      return sequelize;
    },
  },
];
