import {
  Table,
  Column,
  Model,
  Default,
  Unique,
  PrimaryKey,
  BelongsToMany,
} from 'sequelize-typescript';
import { AppUsersRelated } from './App-users-related.entity';

@Table
export class AppUser extends Model {
  @PrimaryKey
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

  @Column
  name: string;

  @Column
  picture: string;

  @BelongsToMany(
    () => AppUser,
    () => AppUsersRelated,
    'sourceUserId',
    'targetUserId',
  )
  mentors: AppUser[];

  @BelongsToMany(
    () => AppUser,
    () => AppUsersRelated,
    'targetUserId',
    'sourceUserId',
  )
  students: AppUser[];
}

export default AppUser;
