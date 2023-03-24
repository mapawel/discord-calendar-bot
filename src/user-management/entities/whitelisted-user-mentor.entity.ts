import { Table, Column, Model, ForeignKey } from 'sequelize-typescript';
import { WhitelistedUser } from './whitelisted-user.entity';
import { MentorUser } from './mentor-user.entity';

@Table
export class WhitelistedUserMentor extends Model {
  @ForeignKey(() => WhitelistedUser)
  @Column
  whitelistedUserId: string;

  @ForeignKey(() => MentorUser)
  @Column
  mentorUserId: string;
}
