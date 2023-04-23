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
        dialect: 'postgres',
        host: process.env.POSTGRES_DB,
        port: Number(process.env.DB_PORT),
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        models: [join(__dirname, '../..', '**/*.entity{.ts,.js}')],
      });
      sequelize.addModels([Role, AppUser, AppUsersRelated, HostCalendar]);
      await sequelize.sync();
      return sequelize;
    },
  },
];
