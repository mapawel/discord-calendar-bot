import {
  Table,
  Column,
  Model,
  Default,
  Unique,
  PrimaryKey,
} from 'sequelize-typescript';

@Table
export class User extends Model {
  @PrimaryKey
  @Unique({ name: 'discordId', msg: 'Discord ID must be unique' })
  @Column
  discordId: string;

  @Column
  name: string;

  @Default(false)
  @Column
  authenticated: boolean;
}
