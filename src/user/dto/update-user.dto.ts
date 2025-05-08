import { OmitType, PartialType } from '@nestjs/mapped-types';
import { signupDto } from './create-user.dto';
import { IsNotEmpty, IsStrongPassword } from 'class-validator';

export class updateUserDto extends PartialType(
  OmitType(signupDto, ['password']),
) {}

export class updatePassDto {
  @IsNotEmpty({ message: 'Current password is required' })
  currentPassword: string;

  @IsStrongPassword()
  @IsNotEmpty({ message: 'New password is required' })
  newPassword: string;
}
