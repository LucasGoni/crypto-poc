import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { UploadFileDto } from './dto/upload-file.dto';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
  private readonly uploadPath = './uploads';
  private readonly logger = new Logger(FilesService.name);

  constructor() {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath);
    }
  }

  validateFile(file: Express.Multer.File): void {
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type.');
    }

    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds the limit of 5MB.');
    }
  }

  async uploadFile(file: Express.Multer.File, uploadFileDto: UploadFileDto) {
    this.logger.log(`Validating file: ${file.originalname}`);
    this.validateFile(file);

    const fileExt = path.extname(file.originalname);
    const filename = `${uuidv4()}${fileExt}`;
    const filePath = path.join(this.uploadPath, filename);

    this.logger.log(`Saving file to: ${filePath}`);
    fs.writeFileSync(filePath, file.buffer);

    const result = {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: filePath,
      description: uploadFileDto.description,
    };

    this.logger.log(`File uploaded successfully: ${JSON.stringify(result)}`);
    return result;
  }
}
