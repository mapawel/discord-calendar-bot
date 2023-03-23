import { Table, Column, Model, Unique } from 'sequelize-typescript';

@Table
export class MentorUser extends Model {
  @Unique({ name: 'discordId', msg: 'Discord ID must be unique' })
  @Column
  discordId: string;
}
