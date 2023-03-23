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
import { MentorUser } from './mentor-user.entity';
import { WhitelistedUserMentor } from './whitelisted-user-mentor.entity';

@Table
export class WhitelistedUser extends Model {
  @Unique({ name: 'discordId', msg: 'Discord ID must be unique' })
  @Column
  discordId: string;

  @BelongsToMany(() => MentorUser, () => WhitelistedUserMentor)
  mentors: MentorUser[];
}
