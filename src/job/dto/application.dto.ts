import { IsMongoId, IsString, MinLength } from 'class-validator';
import { Types } from 'mongoose';

export class ApplicationDto {
  @IsString({ each: true })
  userTechSkills: string[];

  @IsString({ each: true })
  @MinLength(2, { each: true })
  userSoftSkills: string[];

  @IsMongoId()
  job: Types.ObjectId;
}
