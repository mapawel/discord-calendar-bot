import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/providers/users.service';
import { AppUserDTO } from 'src/users/dto/App-user.dto';
import { Meeting } from './interface/Meeting.interface';

@Injectable()
export class MeetingService {
  constructor(private readonly usersService: UsersService) {}

  public async takeAndValidateUserAndHost({
    userDId,
    hostDId,
  }: {
    userDId: string;
    hostDId: string;
  }) {
    let errorResponse: string | undefined;
    const [user, host]: (AppUserDTO | undefined)[] = await Promise.all(
      [userDId, hostDId].map((dId) => this.usersService.getUserByDId(dId)),
    );

    if (!user || !host) {
      throw Error('User or host not found');
    }

    if (!host.aId)
      errorResponse =
        "Host didn't auth the app and connect his calander yet. Let him know about this fact to book a meeting!";

    return { user, host, errorResponse };
  }

  public rebuildMeetingData(
    newData: Partial<Meeting>,
    currentMeetindData: Partial<Meeting> = {},
  ): Partial<Meeting> {
    return { ...currentMeetindData, ...newData };
  }
}
