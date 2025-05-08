import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { userRoles } from 'src/user/user.constants';
@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private role: userRoles) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    return req.currentUser.role === this.role;
  }
}
