import { PartialType } from '@nestjs/mapped-types';
import { CreateJobDto } from './create-job.dto';
import { IsMongoId } from 'class-validator';

export class UpdateJobDto extends PartialType(CreateJobDto) {}

export class IdParamDto {
  @IsMongoId()
  id: string;
}
