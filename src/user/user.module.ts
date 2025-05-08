import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { userModel } from 'src/schemas/user.schema';
import { MailService } from 'src/utils/email.service';
import { PassService } from 'src/utils/password.service';

@Module({
  controllers: [UserController],
  providers: [UserService, MailService, PassService],
  imports: [userModel],
})
export class UserModule {}
