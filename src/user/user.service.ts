import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { MailService } from 'src/utils/email.service';
import { userStatus } from './user.constants';
import { Request } from 'express';
import { otpEmailTemplate, verifyEmailTemplate } from 'src/utils/htmlTemplates';
import { PassService } from 'src/utils/password.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private mailService: MailService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private passService: PassService,
  ) {}

  async signup(req: Request, body: any) {
    const { email, mobileNumber } = body;

    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { mobileNumber }],
    });
    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('email is already exist');
      }
      if (existingUser.mobileNumber === mobileNumber) {
        throw new ConflictException('phone is already exist');
      }
    }

    const hashedPassword = this.passService.hashPassword(body.password);

    body.password = hashedPassword;
    const user = await this.userModel.create(body);
    if (!user) throw new InternalServerErrorException('fail to signup');

    await this.sendVerifyEmail(user, req);

    return {
      message:
        'Created Successfully, Please check your email to verify your account',
      data: user,
    };
  }

  async verifyEmail(token: string) {
    const { _id } = this.jwtService.verify(token, {
      secret: this.configService.get<string>('TOKEN_VER'),
    });

    const user = await this.userModel.findById(_id);
    if (!user) throw new NotFoundException('invalid email, signup');

    if (user.confirmEmail)
      throw new BadRequestException('email is already confirmed');

    if (user.pendingEmail) {
      user.email = user.pendingEmail;
      user.pendingEmail = undefined;
    }

    user.confirmEmail = true;
    await user.save();

    return { message: 'Email confirmed' };
  }

  async login(body: any) {
    const { loginData, password } = body;
    const user = await this.userModel.findOne({
      $or: [
        { email: loginData },
        { mobileNumber: loginData },
        { recoveryEmail: loginData },
      ],
    });

    if (!user || !this.passService.comparePassword(password, user.password)) {
      throw new BadRequestException('invalid info');
    }

    if (!user.confirmEmail) {
      throw new BadRequestException('confirm your email first');
    }

    user.status = userStatus.Online;
    await user.save();

    const token = this.jwtService.sign(
      { _id: user._id, email: user.email },
      { secret: this.configService.get<string>('TOKEN_LOGIN') },
    );
    return {
      message: 'done',
      token,
    };
  }

  async updateAccount(req: Request, body: any, user: any) {
    let message: string = 'Updated Successfully';
    if (body.mobileNumber && body.mobileNumber !== user.mobileNumber) {
      const mobileNumber = await this.userModel.findOne({
        mobileNumber: body.mobileNumber,
      });

      if (mobileNumber)
        throw new ConflictException('mobile number is already exist');
    }

    if (body.email && body.email.toLowerCase() !== user.email) {
      const isEmailExist = await this.userModel.findOne({
        email: body.email,
      });

      if (isEmailExist) throw new ConflictException('Email is already in use');
      user.confirmEmail = false;
      user.pendingEmail = body.email;
      delete body.email;
      if (body.firstName) user.firstName = body.firstName;
      await this.sendVerifyEmail(user, req);

      message = message + ', Please check your email to verify your account';
    }

    Object.assign(user, body);

    await user.save();
    return {
      message,
      data: user,
    };
  }

  async forgetPass(body: any) {
    const { emailOrMobile } = body;

    const user = await this.userModel.findOne({
      $or: [
        { email: emailOrMobile },
        { mobileNumber: emailOrMobile },
        { recoveryEmail: emailOrMobile },
      ],
    });

    if (!user) {
      throw new BadRequestException('invalid info');
    }

    // Generate OTP and set expiry time
    const otp = this.passService.generateOtp(String(user._id));

    await this.mailService.sendEmail({
      to: user.email,
      subject: 'Your OTP Code',
      html: otpEmailTemplate(otp),
    });

    return {
      message:
        'We’ve sent a 6-digit verification code to your email. Please check your inbox.',
    };
  }

  async verifyOTPAndSetPass(body: any) {
    const { userId, otp } = body;
    const isCorrect = this.passService.verifyOtp(otp, String(userId));

    if (!isCorrect) {
      return {
        success: false,
        message: 'Invalid or expired OTP',
      };
    }
    return this.updatePassword(body, userId);
  }

  async updatePassword(body: any, user: any) {
    if (!body.otp) {
      if (
        !this.passService.comparePassword(body.currentPassword, user.password)
      )
        throw new BadRequestException('Current password is incorrect');

      if (this.passService.comparePassword(body.newPassword, user.password))
        throw new BadRequestException(
          'New password must be different from the current password',
        );
    } else {
      user = { _id: body.userId };
    }
    const hashedPassword = this.passService.hashPassword(body.newPassword);
    await this.userModel.findByIdAndUpdate(user._id, {
      password: hashedPassword,
    });

    return {
      success: true,
      message: 'Password updated successfully',
    };
  }

  async deleteAccount(user: any) {
    await this.userModel.findByIdAndDelete(user._id);
    return { message: 'done' };
  }

  async getUsersByRecoveryEmail(recoveryEmail: any) {
    const users = await this.userModel.find({ recoveryEmail });
    if (!users.length) throw new NotFoundException('no users found');
    return { message: 'done', data: users };
  }

  async getUserProfileById(id: any) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('user not found');
    return { data: user };
  }

  async sendVerifyEmail(user: any, req: Request) {
    const authToken = this.jwtService.sign(
      { _id: user._id },
      { secret: this.configService.get<string>('TOKEN_VER') },
    );

    const link = `${req.protocol}://${req.headers.host}/user/verifyEmail/${authToken}`;

    await this.mailService.sendEmail({
      to: user.pendingEmail || user.email,
      subject: 'Confirm Email',
      html: verifyEmailTemplate(user.firstName, link),
    });
  }
}
