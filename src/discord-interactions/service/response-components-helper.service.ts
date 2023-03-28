import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import { UsersService } from 'src/users/providers/users.service';
import { AppUserDTO } from 'src/users/dto/App-user.dto';
import { DiscordUserDTO } from '../dto/Discord-user.dto';
import { AxiosProvider } from 'src/axios/provider/axios.provider';
import { AppCommand } from 'src/app-SETUP/commands.list';
import { Commands } from 'src/app-SETUP/commands.enum';

config();

@Injectable()
export class ResponseComponentsHelperService {
  constructor(
    private readonly usersService: UsersService,
    private readonly axiosProvider: AxiosProvider,
  ) {}

  public async getUsersToShow(): Promise<DiscordUserDTO[]> {
    // TODO to refactor to speed it up!
    const allUsers: DiscordUserDTO[] =
      await this.usersService.getUsersFromDiscord();
    const alreadyWhitelistedUsers: AppUserDTO[] =
      await this.usersService.getAllWhitelistedUsers();
    const existingUsersDids: string[] = alreadyWhitelistedUsers.map(
      ({ dId }: { dId: string }) => dId,
    );
    return allUsers.filter(
      ({ id }: { id: string }) =>
        id !== process.env.APP_ID && !existingUsersDids.includes(id),
    );
  }

  public findContent(
    array: AppCommand[],
    objName: Commands,
  ): string | undefined {
    return array.find((obj) => obj.name === objName)?.content;
  }
}
