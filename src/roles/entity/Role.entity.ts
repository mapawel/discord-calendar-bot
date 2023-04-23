import { Table, Column, Model, PrimaryKey, Unique } from 'sequelize-typescript';

@Table
export class Role extends Model {
  @PrimaryKey
  @Unique({ name: 'id', msg: 'Role ID must be unique' })
  @Column
  id: string;

  @Column
  name: string;
}

export default Role;
