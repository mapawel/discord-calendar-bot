import { join } from 'path';
import { Sequelize } from 'sequelize-typescript';
import { Role } from '../../roles/entity/Role.entity';
import { AppUser } from 'src/users/entity/App-user.entity';
import { Mentor } from 'src/users/entity/Mentor.entity';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: join(process.cwd(), 'db', 'test.sqlite'),
      });
      sequelize.addModels([Role, AppUser, Mentor]);
      await sequelize.sync();
      return sequelize;
    },
  },
];
