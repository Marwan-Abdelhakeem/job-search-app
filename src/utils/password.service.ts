import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compareSync, hashSync } from 'bcrypt';
import { totp } from 'otplib';

@Injectable()
export class PassService {
  private readonly secret: string;
  private readonly saltRounds: number;

  constructor(private configService: ConfigService) {
    this.secret =
      this.configService.get<string>('OTP_SECRET') ?? 'default-secret';
    this.saltRounds = Number(
      this.configService.get<number>('BCRYPT_SALT_ROUNDS') ?? 11,
    );
  }

  generateOtp(userId: string): string {
    totp.options = { step: 3000 }; // 5 min
    return totp.generate(userId + this.secret);
  }

  verifyOtp(otp: string, userId: string): boolean {
    return totp.check(otp, userId + this.secret);
  }

  comparePassword(password1: string, password2: string): boolean {
    return compareSync(password1, password2);
  }

  hashPassword(password: string): string {
    return hashSync(password, this.saltRounds);
  }
}
