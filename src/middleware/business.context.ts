import { Injectable, NestMiddleware } from '@nest/common';

@Injectable()
export class BusinessContextMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    req.businessId = req.user?.businessId;
    next();
  }
}
