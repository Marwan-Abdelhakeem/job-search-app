import {
  filevalidation,
  fileValidationTypes,
} from 'src/validations/file.validation';
import { diskStorage } from 'multer';

// إعدادات Multer لتخزين الملفات على Cloudinary
export const multerCloudOptions = {
  storage: diskStorage({}),
  fileFilter: filevalidation(fileValidationTypes.file),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
};
