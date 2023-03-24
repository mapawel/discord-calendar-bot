import { Table, Column, Model, ForeignKey } from 'sequelize-typescript';
import { WhitelistedUser } from './Whitelisted-user.entity';
import { Mentor } from './Mentor.entity';

@Table
export class WhitelistedUserMentor extends Model {
  @ForeignKey(() => WhitelistedUser)
  @Column
  whitelistedUserId: string;

  @ForeignKey(() => Mentor)
  @Column
  mentorUserId: string;
}
