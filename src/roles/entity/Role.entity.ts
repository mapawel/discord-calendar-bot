import { Table, Column, Model, Default, Unique } from 'sequelize-typescript';

@Table
export class Role extends Model {
  @Unique({ name: 'id', msg: 'Role ID must be unique' })
  @Column
  roleId: string;

  @Column
  name: string;
}
