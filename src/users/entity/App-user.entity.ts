import {
  Table,
  Column,
  Model,
  Default,
  Unique,
  PrimaryKey,
} from 'sequelize-typescript';

@Table
export class AppUser extends Model {
  @Unique({ name: 'id', msg: 'Discord ID must be unique' })
  @Column
  dId: string;

  @Column
  aId: string;

  @Column
  username: string;

  @Column
  email: string;

  @Default(false)
  @Column
  authenticated: boolean;

  @Column
  IdP: string;

  @Default(false)
  @Column
  whitelisted: boolean;

  // @BelongsToMany(() => Mentor, () => WhitelistedUserMentor)
  // mentors: Mentor[];
}
