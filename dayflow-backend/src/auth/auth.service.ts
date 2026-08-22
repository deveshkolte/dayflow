import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma.service';
import { LoginDto } from './dto/login.dto';
import { AuthenticatedUser } from './auth.types';

// AuthService owns credential verification and short-lived access-token creation.
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(credentials: LoginDto) {
    const email = credentials.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive || !user.emailVerifiedAt) {
      throw new UnauthorizedException('Invalid credentials or unverified account.');
    }

    const passwordMatches = await bcrypt.compare(credentials.password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials or unverified account.');
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new InternalServerErrorException('JWT_SECRET is not configured.');
    }

    const identity: AuthenticatedUser = {
      id: user.id,
      employeeId: user.employeeId,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(
      { sub: identity.id, employeeId: identity.employeeId, email: identity.email, role: identity.role },
      { secret, expiresIn: '1h' },
    );

    return { accessToken, user: identity };
  }
}
