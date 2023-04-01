import { Injectable } from '@nestjs/common';
import { Meeting } from './interface/Meeting.interface';

@Injectable()
export class MeetingService {
  public rebuildMeetingData(
    newData: Partial<Meeting>,
    currentMeetindData: Partial<Meeting> = {},
  ): Partial<Meeting> {
    return { ...currentMeetindData, ...newData };
  }
}
