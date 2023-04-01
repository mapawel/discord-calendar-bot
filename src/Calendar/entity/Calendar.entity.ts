import { Table, Column, Model, Unique, PrimaryKey } from 'sequelize-typescript';

@Table
export class Calendar extends Model {
  @PrimaryKey
  @Unique({ name: 'id', msg: 'Discord ID must be unique' })
  @Column
  dId: string;

  @Column
  googleToken: string;

  @Column
  calendarId: string;
}
