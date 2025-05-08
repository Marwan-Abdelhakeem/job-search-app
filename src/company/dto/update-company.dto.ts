import { PartialType } from '@nestjs/mapped-types';
import { createCompanyDto } from './create-company.dto';

export class updateCompanyDto extends PartialType(createCompanyDto) {}
