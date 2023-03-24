import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { readFile, readdir, writeFile, unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class StateFileRepository {
  private readonly DBpathStrings = ['db', 'files'];

  public async findAll(folderName: string): Promise<string[]> {
    try {
      const prev_tokens: string[] = [];
      for (const file of await this.readDBFolder(folderName)) {
        const buffer = await readFile(
          join(this.pathToDBFiles(folderName), file),
        );
        prev_tokens.push(JSON.parse(buffer.toString()));
      }
      return prev_tokens;
    } catch (err: any) {
      throw new Error('Error while reading the DB files');
    }
  }

  public async findOne(
    discordId: string,
    folderName: string,
  ): Promise<string | undefined> {
    try {
      if (!(await this.isExisting(discordId, folderName))) return undefined;
      const buffer = await readFile(
        join(this.pathToDBFiles(folderName), `${discordId}.txt`),
      );
      return JSON.parse(buffer.toString());
    } catch (err: any) {
      if (err instanceof NotFoundException) throw err;
      throw new Error('Error while reading the DB file' + err.message);
    }
  }

  public async createOne(
    discordId: string,
    prev_token: string,
    folderName: string,
  ): Promise<string> {
    try {
      if (await this.isExisting(discordId, folderName))
        throw new ConflictException(`File: ${discordId} already exists`);

      await this.writeToFile(
        this.filenameWhPath(discordId, folderName),
        JSON.stringify(prev_token),
      );

      return prev_token;
    } catch (err: any) {
      if (err instanceof ConflictException) throw err;
      throw new Error('Error while writing the DB file');
    }
  }

  public async updateOne(
    discordId: string,
    prev_token: string,
    folderName: string,
  ): Promise<string> {
    try {
      const discrordIdToUpdate: string | undefined = await this.findOne(
        discordId,
        folderName,
      );
      if (!discrordIdToUpdate)
        throw new NotFoundException(`File: ${discordId} not found`);

      await this.writeToFile(
        this.filenameWhPath(discordId, folderName),
        JSON.stringify(prev_token),
      );
      return prev_token;
    } catch (err: any) {
      throw new Error('Error while updaing the DB file');
    }
  }

  public async createOrUpdate(
    discordId: string,
    prev_token: string,
    folderName: string,
  ): Promise<string> {
    try {
      await this.writeToFile(
        this.filenameWhPath(discordId, folderName),
        JSON.stringify(prev_token),
      );
      return prev_token;
    } catch (err: any) {
      throw new Error('Error while updaing the DB file');
    }
  }

  public async removeOne(
    discordId: string,
    folderName: string,
  ): Promise<boolean> {
    try {
      const discrordIdToRemove: string | undefined = await this.findOne(
        discordId,
        folderName,
      );
      if (!discrordIdToRemove) return false;
      await unlink(this.filenameWhPath(discordId, folderName));
      return true;
    } catch (err: any) {
      throw new Error('Error while removing the DB file');
    }
  }

  public async isExisting(
    discordId: string,
    folderName: string,
  ): Promise<boolean> {
    for (const file of await this.readDBFolder(folderName)) {
      if (file === `${discordId}.txt`) return true;
    }
    return false;
  }

  private filenameWhPath(discordId: string, folderName: string): string {
    return `${join(this.pathToDBFiles(folderName), `${discordId}`)}.txt`;
  }

  private pathToDBFiles(folderName: string): string {
    return join(process.cwd(), ...this.DBpathStrings, folderName);
  }

  private async readDBFolder(folderName: string): Promise<string[]> {
    try {
      return await readdir(this.pathToDBFiles(folderName));
    } catch (err: any) {
      throw new Error('Error while reading folder with DB files.');
    }
  }

  private async writeToFile(name: string, data: string): Promise<void> {
    const dataBuffer: Buffer = Buffer.from(data);
    await writeFile(name, dataBuffer);
  }
}
