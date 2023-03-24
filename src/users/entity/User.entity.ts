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
  @Unique({ name: 'id', msg: 'Discord ID must be unique' })
  @Column
  id: string;

  @Column
  username: string;

  @Default(false)
  @Column
  authenticated: boolean;
}
