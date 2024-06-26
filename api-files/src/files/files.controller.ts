import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, Body, Logger } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';

@Controller('files')
export class FilesController {
  private readonly logger = new Logger(FilesController.name);

  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File upload',
    type: UploadFileDto,
  })
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body() uploadFileDto: UploadFileDto) {
    try {
      this.logger.log(`Received file upload request: ${file.originalname}`);
      const result = await this.filesService.uploadFile(file, uploadFileDto);
      this.logger.log(`File upload processed successfully: ${file.originalname}`);
      return result;
    } catch (error) {
      this.logger.error(`File upload failed: ${error.message}`, error.stack);
      throw new BadRequestException(error.message);
    }
  }
}
