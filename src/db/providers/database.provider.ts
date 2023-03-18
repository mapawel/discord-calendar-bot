import { Sequelize } from 'sequelize-typescript';
import { User } from '../../calendar-bot/entities/User.entity';
import { Role } from 'src/roles/entity/Role.entity';
import { join } from 'path';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: join(process.cwd(), 'db', 'test.sqlite'),
      });
      sequelize.addModels([User, Role]);
      await sequelize.sync();
      return sequelize;
    },
  },
];
