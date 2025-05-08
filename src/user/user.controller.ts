import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { Request } from 'express';
import { currentUser } from 'src/decorators/current-user.decorator';
import { IdParamDto, signupDto } from './dto/create-user.dto';
import { Serialization } from 'src/interceptors/serialization.interceptor';
import { updatePassDto, updateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('signup')
  @UseInterceptors(Serialization)
  signup(@Req() req: Request, @Body() body: signupDto) {
    return this.userService.signup(req, body);
  }

  @Get('verifyEmail/:token')
  verifyEmail(@Param('token') token: string) {
    return this.userService.verifyEmail(token);
  }

  @Post('login')
  login(@Body() body: any) {
    return this.userService.login(body);
  }

  @Put()
  @UseGuards(AuthGuard)
  @UseInterceptors(Serialization)
  updateAccount(
    @Req() req: Request,
    @Body() body: updateUserDto,
    @currentUser() user: any,
  ) {
    return this.userService.updateAccount(req, body, user);
  }

  @Patch('updatePassword')
  @UseGuards(AuthGuard)
  updatePassword(@Body() body: updatePassDto, @currentUser() user: any) {
    return this.userService.updatePassword(body, user);
  }

  @Delete()
  @UseGuards(AuthGuard)
  deleteAccount(@currentUser() user: any) {
    return this.userService.deleteAccount(user);
  }

  @Get('getUserData')
  @UseGuards(AuthGuard)
  @UseInterceptors(Serialization)
  getUserData(@currentUser() user: any) {
    return { data: user };
  }

  @Get('profile/:id')
  @UseInterceptors(Serialization)
  getUserProfileById(@Param() params: IdParamDto) {
    return this.userService.getUserProfileById(params.id);
  }

  @Post('forgetPassword')
  forgetPass(@Body() body: any) {
    return this.userService.forgetPass(body);
  }

  @Patch('resetPassword')
  verifyOTPAndSetPass(@Body() body: any) {
    return this.userService.verifyOTPAndSetPass(body);
  }

  @Get('by-recovery-email')
  @UseInterceptors(Serialization)
  getUsersByRecoveryEmail(@Query() query: updateUserDto) {
    return this.userService.getUsersByRecoveryEmail(query.recoveryEmail);
  }
}
