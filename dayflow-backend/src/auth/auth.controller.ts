import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthenticatedRequest } from './auth.types';

// AuthController exposes only the login and current-user operations needed by the MVP flow.
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() input: RegisterDto) {
    return { success: true, data: await this.authService.register(input) };
  }

  @Post('login')
  async login(@Body() credentials: LoginDto) {
    return { success: true, data: await this.authService.login(credentials) };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  currentUser(@Req() request: AuthenticatedRequest) {
    return { success: true, data: request.user };
  }
}
