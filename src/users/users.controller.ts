import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Body,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';
import { Roles } from '../roles/roles.decorator';
@Controller('users')
export class UsersController {
  constructor(private prisma: PrismaService) {}
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getProfile(@Request() req) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        businesses: {
          include: {
            business: true,
          },
        },
      },
    });
    if (!user) {
      throw new Error('Users not Found');
    }
    console.log('user', user);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      businesses: user.businesses.map((m) => ({
        businessId: m.business.id,
        name: m.business.name,
        role: m.role,
      })),
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('businesses')
  async getUserBusinesses(@Request() req) {
    const memberships = await this.prisma.businessMember.findMany({
      where: { userId: req.user.userId },
      include: { business: true },
    });

    return memberships.map((m) => ({
      businessId: m.business.id,
      name: m.business.name,
      role: m.role,
    }));
  }
  @UseGuards(AuthGuard('jwt'))
  @Post('businesses')
  async createBusiness(@Request() req, @Body() body: { name: string }) {
    const business = await this.prisma.business.create({
      data: {
        name: body.name,
      },
    });

    await this.prisma.businessMember.create({
      data: {
        userId: req.user.userId,
        businessId: business.id,
        role: 'OWNER',
      },
    });
    return business;
  }

  @UseGuards(AuthGuard('jwt'))
  @Roles('OWNER')
  @Delete('businesses')
  async deleteBusiness(@Request() req) {
    const business = await this.prisma.business.findUnique({
      where: { id: req.user.businessId },
    });
    if (!business) {
      throw new Error('Business not found.');
    }

    await this.prisma.business.delete({
      where: { id: business.id },
    });
  }
}
