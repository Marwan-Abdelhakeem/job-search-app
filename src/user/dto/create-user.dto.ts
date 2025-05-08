import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';
import { userRoles } from '../user.constants';

export class signupDto {
  @IsString()
  @MaxLength(10)
  @MinLength(3)
  firstName: string;

  @IsString()
  @MaxLength(10)
  @MinLength(3)
  lastName: string;

  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;

  @IsEmail()
  recoveryEmail: string;

  @IsDateString()
  DOB: Date;

  @IsString()
  mobileNumber: string;

  @IsEnum(userRoles)
  role: string;
}

export class IdParamDto {
  @IsMongoId()
  id: string;
}

export class resetPassDto {
  @IsMongoId()
  id: string;

  @IsString()
  otp: string;
}
