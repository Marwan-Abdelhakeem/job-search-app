import { BadRequestException } from '@nestjs/common';

type fileT = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
};

type cbT = (error: Error | null, acceptFile: boolean) => void;

export const fileValidationTypes = {
  image: ['image/png', 'image/jpeg', 'image/jpg'],
  file: ['application/pdf', 'application/msword'],
};

export const filevalidation = (allowType = fileValidationTypes.image) => {
  return (req: any, file: fileT, cb: cbT) => {
    if (allowType.includes(file.mimetype)) {
      return cb(null, true);
    }
    cb(new BadRequestException('invalid file formate'), false);
  };
};
