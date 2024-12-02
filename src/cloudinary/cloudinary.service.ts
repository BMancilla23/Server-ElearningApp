import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiOptions,
  UploadApiResponse,
} from 'cloudinary';
import * as sharp from 'sharp';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  async resizeAndOptimize(
    buffer: Buffer,
    width: number,
    height: number,
    format: string = 'webp',
    fit: string = 'cover',
  ) {
    const validFormats = ['webp', 'jpg', 'png', 'jpeg'] as const;

    if (!validFormats.includes(format as any)) {
      throw new BadRequestException('Invalid format');
    }

    const resizedBuffer = await sharp(buffer)
      .resize(width, height, {
        fit: fit as keyof sharp.FitEnum,
      })
      .toFormat(format as keyof sharp.FormatEnum)
      .toBuffer();

    return resizedBuffer;
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      console.log('Imagen eliminada:', result);
    } catch (error) {
      console.error('Error al eliminar la imagen:', error);
      throw new InternalServerErrorException(
        'Error al eliminar la imagen de Cloudinary',
      );
    }
  }

  // Función para subir un archivo a Cloudinary
  async uploadStream(
    buffer: Buffer,
    options?: UploadApiOptions,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    if (!buffer || buffer.length === 0) {
      throw new BadRequestException('Buffer is empty or undefined');
    }

    try {
      /* console.log('Buffer size:', buffer.length);
      console.log('Buffer type:', typeof buffer); */

      /* // Procesar la imagen con Sharp
      const proccessedBuffer = await sharp(file.buffer)
        .resize(500, 500, {
          fit: 'cover',
        })
        .toFormat('webp')
        .toBuffer(); */

      const uploadOptions: UploadApiOptions = {
        folder:
          `lms-project/${options.folder}` || `default-folder/${options.folder}`,
        ...options,
      };

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) return reject(new BadRequestException(error.message));
            resolve(result as UploadApiResponse);
          },
        );
        /*  const stream = streamifier.createReadStream(proccessedBuffer); */

        const readableStream = new Readable();

        readableStream.push(buffer);
        readableStream.push(null);

        /*  console.log('Stream created', stream); */
        readableStream.pipe(uploadStream).on('error', (streamError) => {
          console.error('Stream error', streamError);
          reject(
            new InternalServerErrorException({
              Message: 'Cloudinary upload failed',
              Error: streamError.message,
            }),
          );
        });
      });
    } catch (error) {
      console.error('Upload failed', error);
      throw new InternalServerErrorException({
        Message: 'Cloudinary upload failed',
        Error: error.message,
      });
    }
  }
}
