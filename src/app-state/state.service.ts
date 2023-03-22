import { Injectable } from '@nestjs/common';
import { StateFileRepository } from './state.file-repository';
@Injectable()
export class StateService {
  constructor(private readonly stateFileRepository: StateFileRepository) {}

  private state: any = {};

  public async saveThisAsSession(
    discordId: string,
    token: string,
  ): Promise<void> {
    await this.stateFileRepository.createOrUpdate(discordId, token);
  }

  public async loadTokenForDiscordId(
    discordId: string,
  ): Promise<string | undefined> {
    return await this.stateFileRepository.findOne(discordId);
  }

  public async removeTokenForDiscordId(discordId: string): Promise<boolean> {
    return await this.stateFileRepository.removeOne(discordId);
  }
}
