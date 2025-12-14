import { Injectable, NestMiddleware } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private tenantService: TenantService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const tenant = await this.tenantService.resolveTenant(req);
    // Attach to request for downstream use
    (req as any).tenant = tenant;
    next();
  }
}
