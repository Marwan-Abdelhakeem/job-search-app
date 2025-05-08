import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  /** Upload one file */
  async uploadFile(
    filePath: string,
    folder: string = `Job_Search_App`,
  ): Promise<UploadApiResponse> {
    try {
      return await cloudinary.uploader.upload(filePath, {
        folder,
        public_id: randomUUID(),
        resource_type: 'auto',
      });
    } catch (e) {
      throw new InternalServerErrorException(
        `Upload failed: ${(e as any).message}`,
      );
    }
  }

  /** Upload a group of files */
  async uploadFiles(
    filePaths: string[],
    folder: string = `Job_Search_App`,
  ): Promise<UploadApiResponse[]> {
    const results: UploadApiResponse[] = [];
    for (const path of filePaths) {
      results.push(await this.uploadFile(path, folder));
    }
    return results;
  }

  /** Delete a single file */
  async deleteFile(
    public_id: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    try {
      const res = await cloudinary.uploader.destroy(public_id);
      if (res.result === 'not found') {
        throw new NotFoundException(`Image ${public_id} not found`);
      }
      return res; //{ result: 'ok' }
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new InternalServerErrorException(
        `Delete failed: ${(e as any).message}`,
      );
    }
  }

  /** Delete a group of files */
  async deleteFiles(
    publicIds: string[],
  ): Promise<(UploadApiResponse | UploadApiErrorResponse)[]> {
    return Promise.all(publicIds.map((id) => this.deleteFile(id)));
  }

  /** Fetch file details*/
  async getFileDetails(public_id: string): Promise<any> {
    try {
      return await cloudinary.api.resource(public_id);
    } catch (e) {
      throw new NotFoundException(
        `Fetch details failed: ${(e as any).message}`,
      );
    }
  }

  /** Fetch the list of resources into a folder */
  async listResources(
    folder: string = `Job_Search_App`,
    maxResults: number = 30,
    nextCursor?: string,
  ): Promise<any> {
    try {
      return await cloudinary.api.resources({
        resource_type: 'auto',
        type: 'upload',
        prefix: folder,
        max_results: maxResults,
        next_cursor: nextCursor,
      });
    } catch (e) {
      throw new InternalServerErrorException(
        `List resources failed: ${(e as any).message}`,
      );
    }
  }

  /** Edit public_id (rename) */
  async renameFile(public_id: string, newPublicId: string): Promise<any> {
    try {
      return await cloudinary.uploader.rename(public_id, newPublicId, {
        overwrite: true,
      });
    } catch (e) {
      throw new BadRequestException(`Rename failed: ${(e as any).message}`);
    }
  }

  /** Update an image (overwrite) */
  async updateFile(
    public_id: string,
    filePath: string,
  ): Promise<UploadApiResponse> {
    try {
      return await cloudinary.uploader.upload(filePath, {
        public_id,
        overwrite: true,
        resource_type: 'auto',
      });
    } catch (e) {
      throw new InternalServerErrorException(
        `Update failed: ${(e as any).message}`,
      );
    }
  }
}
