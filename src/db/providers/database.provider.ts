import { Sequelize } from 'sequelize-typescript';
import { User } from '../../calendar-bot/entities/User.entity';
import { join } from 'path';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: join(process.cwd(), 'db', 'test.sqlite'),
      });
      sequelize.addModels([User]);
      await sequelize.sync();
      return sequelize;
    },
  },
];
