import { Table, Column, Model, Default, Unique } from 'sequelize-typescript';

@Table
export class User extends Model {
  //TODO to uncomment
  // @Unique({ name: 'discordId', msg: 'Discord ID must be unique' })
  @Column
  discordId: string;

  @Column
  name: string;

  @Default(false)
  @Column
  authenticated: boolean;
}
