import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { userStatus } from 'src/user/user.constants';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const { token } = request.headers;

    if (!token) throw new BadRequestException('login first');

    try {
      const { _id } = this.jwtService.verify(token, {
        secret: this.configService.get<string>('TOKEN_LOGIN'),
      });

      const user = await this.userModel.findById(_id);

      if (!user) {
        throw new NotFoundException('user not found');
      }

      if (user.status != userStatus.Online) {
        throw new BadRequestException('you need to login again');
      }

      request.currentUser = user;
      return true;
    } catch (err) {
      if (err.name === 'JsonWebTokenError') {
        throw new BadRequestException('Invalid or expired token.');
      }
      throw err;
    }
  }
}
