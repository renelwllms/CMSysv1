import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class DemoReadonlyInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const user = req?.user;

    if (user?.isDemo) {
      const method = (req?.method || '').toUpperCase();
      const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);
      if (!safeMethods.has(method)) {
        throw new ForbiddenException('Demo accounts are read-only.');
      }
    }

    return next.handle();
  }
}
