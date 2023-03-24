import {
  Table,
  Column,
  Model,
  Unique,
  BelongsToMany,
  PrimaryKey,
} from 'sequelize-typescript';
import { Mentor } from './Mentor.entity';
import { WhitelistedUserMentor } from './Whitelisted-user-mentor.entity';

@Table
export class WhitelistedUser extends Model {
  @PrimaryKey
  @Unique({ name: 'id', msg: 'Discord ID must be unique' })
  @Column
  id: string;

  @Column
  username: string;

  @BelongsToMany(() => Mentor, () => WhitelistedUserMentor)
  mentors: Mentor[];
}
