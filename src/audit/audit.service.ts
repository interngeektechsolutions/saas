import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) { }
  async log(data: {
    businessId: string;
    userId: string;
    action: string;
    entity: string;
    entityId: string;
  }) {
    return await this.prisma.auditLog.create({
      data,
    });
  }
}
