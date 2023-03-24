import { Injectable } from '@nestjs/common';
import { StateFileRepository } from './state.file-repository';
@Injectable()
export class StateService {
  constructor(private readonly stateFileRepository: StateFileRepository) {}

  public async saveDataAsSession(
    discordId: string,
    token: string,
    folderName: string,
  ): Promise<void> {
    await this.stateFileRepository.createOrUpdate(discordId, token, folderName);
  }

  public async loadDataForDiscordId(
    discordId: string,
    folderName: string,
  ): Promise<string | undefined> {
    return await this.stateFileRepository.findOne(discordId, folderName);
  }

  public async removeDataForDiscordId(
    discordId: string,
    folderName: string,
  ): Promise<boolean> {
    return await this.stateFileRepository.removeOne(discordId, folderName);
  }
}
