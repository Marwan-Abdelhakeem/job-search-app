import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { map, Observable } from 'rxjs';
import { UserDto } from 'src/user/dto/user.dto';

export class Serialization implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((value) => {
        return {
          message: value.message,
          data: plainToInstance(
            UserDto,
            Array.isArray(value.data)
              ? value.data.map((user) => user.toObject())
              : value.data.toObject(),
          ),
        };
      }),
    );
  }
}
