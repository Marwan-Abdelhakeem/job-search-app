import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { IsLargerThan } from 'src/validator/range.validate';

export class createCompanyDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  companyName: string;

  @IsEmail()
  companyEmail: string;

  @IsString()
  @MaxLength(1000)
  @MinLength(10)
  description: string;

  @IsString()
  @MaxLength(1000)
  @MinLength(10)
  industry: string;

  @IsString()
  @MaxLength(1000)
  @MinLength(10)
  address: string;

  @ValidateNested()
  @Type(() => noEmployees)
  noEmployees: { from: Number; to: Number };
}

class noEmployees {
  @IsInt()
  @Min(1)
  from: number;

  @IsInt()
  @Min(2)
  @IsLargerThan('from')
  to: number;
}
