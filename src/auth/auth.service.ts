import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}
  async signup(dto: SignupDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
      },
    });

    const business = await this.prisma.business.create({
      data: {
        name: `${user.name}'s Workspace`,
      },
    });

    await this.prisma.businessMember.create({
      data: {
        userId: user.id,
        businessId: business.id,
        role: 'OWNER',
      },
    });

    return { id: user.id, name: user.name, email: user.email };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid Password or Email');
    }

    const business = await this.prisma.businessMember.findFirst({
      where: {
        userId: user.id,
      },
    });

    if (!business) {
      throw new Error('Business not found');
    }

    const token = this.jwt.sign({
      userId: user.id,
      businessId: business.businessId,
    });

    return {
      access_token: token,
      userId: user.id,
      businessId: business.businessId,
    };
  }

  async switchBusiness(userId: string, businessId: string) {
    const membership = await this.prisma.businessMember.findFirst({
      where: {
        userId,
        businessId,
      },
    });
    if (!membership) {
      throw new Error('Membership not found');
    }

    const token = this.jwt.sign({
      userId,
      businessId,
    });

    return { access_token: token, userId, businessId };
  }
}
