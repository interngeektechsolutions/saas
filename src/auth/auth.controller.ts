import { Controller, Request, Body, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('switch-business')
  async switchBusiness(@Request() req, @Body() body: { businessId: string }) {
    return this.authService.switchBusiness(req.user.userId, body.businessId);
  }
}
