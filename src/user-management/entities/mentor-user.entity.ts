import {
  Table,
  Column,
  Model,
  Unique,
  HasMany,
  BelongsToMany,
  ForeignKey,
  PrimaryKey,
} from 'sequelize-typescript';
import { WhitelistedUser } from './whitelisted-user.entity';
import { WhitelistedUserMentor } from './whitelisted-user-mentor.entity';

@Table
export class MentorUser extends Model {
  @PrimaryKey
  @Unique({ name: 'discordId', msg: 'Discord ID must be unique' })
  @Column
  discordId: string;

  @Column
  username: string;

  @BelongsToMany(() => WhitelistedUser, () => WhitelistedUserMentor)
  whitelistedUsers: WhitelistedUser[];
}
