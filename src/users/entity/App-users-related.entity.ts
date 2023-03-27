import {
  Table,
  Column,
  Model,
  ForeignKey,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';
import { AppUser } from './App-user.entity';

@Table
export class AppUsersRelated extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => AppUser)
  @Column
  sourceUserId: string;

  @ForeignKey(() => AppUser)
  @Column
  targetUserId: string;
}
