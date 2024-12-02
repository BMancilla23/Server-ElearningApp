import { HttpStatus, ParseFilePipeBuilder } from '@nestjs/common';

export const fileValidators = new ParseFilePipeBuilder()
  .addFileTypeValidator({
    fileType: /image\/(jpeg|png|webp|jpg)$/, // Usa un regex para validar los tipos MIME
  })
  .addMaxSizeValidator({
    maxSize: 5 * 1024 * 1024, // Tamaño máximo de archivo permitido
    message: 'File size exceeds 5MB',
  })
  .build({
    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  });
