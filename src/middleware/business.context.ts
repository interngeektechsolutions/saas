import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class BusinessContextMiddleware implements NestMiddleware {
  use(req: any, next: () => void) {
    req.businessId = req.user?.businessId;
    next();
  }
}
