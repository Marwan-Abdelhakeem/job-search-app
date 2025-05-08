import { IsMongoId, IsString, MinLength } from 'class-validator';
import { Types } from 'mongoose';

export class CreateJobDto {
  @IsString()
  jobTitle: string;

  @IsString()
  jobDescription: string;

  @IsString({ each: true })
  @MinLength(2, { each: true })
  technicalSkills: string[];

  @IsString({ each: true })
  softSkills: string[];

  @IsString()
  jobLocation: string;

  @IsString()
  workingTime: string;

  @IsString()
  seniorityLevel: string;

  @IsMongoId()
  company: Types.ObjectId;
}
