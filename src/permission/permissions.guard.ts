import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [context.getHandler, context.getClass()],
    );

    if (!requiredPermissions) return true;
    const { user } = context.switchToHttp().getRequest();
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { role: user.role },
      include: { permission: true },
    });

    const userPermissions = rolePermissions.map((rp) => rp.permission.name);
    const hasPermission = requiredPermissions.every((p) =>
      userPermissions.includes(p),
    );
    if (!hasPermission) {
      throw new ForbiddenException('Permission denied');
    }
    return true;
  }
}
