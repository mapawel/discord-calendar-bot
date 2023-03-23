import { Table, Column, Model, ForeignKey } from 'sequelize-typescript';
import { WhitelistedUser } from './whitelisted-user.entity';
import { MentorUser } from './mentor-user.entity';

@Table
export class WhitelistedUserMentor extends Model {
  @ForeignKey(() => WhitelistedUser)
  @Column
  mentorId: number;

  @ForeignKey(() => MentorUser)
  @Column
  whitelistedUserId: number;
}
