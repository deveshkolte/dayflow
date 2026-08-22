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

  @Post(['register', 'signup'])
  async register(@Body() input: RegisterDto) {
    const data = await this.authService.register(input);
    return { success: true, data, token: data.token, accessToken: data.accessToken, user: data.user };
  }

  @Post('login')
  async login(@Body() credentials: LoginDto) {
    const data = await this.authService.login(credentials);
    return { success: true, data, token: data.token, accessToken: data.accessToken, user: data.user };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  currentUser(@Req() request: AuthenticatedRequest) {
    return { success: true, data: request.user, user: request.user };
  }
}
