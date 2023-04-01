import { Injectable } from '@nestjs/common';
import { StateFileRepository } from './State-file.repository';
@Injectable()
export class StateService {
  constructor(private readonly stateFileRepository: StateFileRepository) {}

  public async saveDataAsSession(
    id: string,
    token: string,
    folderName: string,
  ): Promise<void> {
    await this.stateFileRepository.createOrUpdate(id, token, folderName);
  }

  public async loadDataForUserId(
    id: string,
    folderName: string,
  ): Promise<string | undefined> {
    return await this.stateFileRepository.findOne(id, folderName);
  }

  public async removeDataForUserId(
    id: string,
    folderName: string,
  ): Promise<boolean> {
    return await this.stateFileRepository.removeOne(id, folderName);
  }
}
