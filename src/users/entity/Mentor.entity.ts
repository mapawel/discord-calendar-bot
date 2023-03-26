import {
  Table,
  Column,
  Model,
  Unique,
  BelongsToMany,
  PrimaryKey,
} from 'sequelize-typescript';
// import { WhitelistedUser } from './Whitelisted-user.entity';
// import { WhitelistedUserMentor } from './Whitelisted-user-mentor.entity';

@Table
export class Mentor extends Model {
  @PrimaryKey
  @Unique({ name: 'id', msg: 'Discord ID must be unique' })
  @Column
  id: string;

  @Column
  username: string;

  // @BelongsToMany(() => WhitelistedUser, () => WhitelistedUserMentor)
  // users: WhitelistedUser[];
}
