import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthenticatedUser } from './auth.types';

// AuthService owns credential verification and short-lived access-token creation.
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(input: RegisterDto) {
    const email = input.email.trim().toLowerCase();
    const employeeId = input.employeeId.trim().toUpperCase();
    const firstName = input.firstName.trim();
    const lastName = input.lastName.trim();

    if (!employeeId || !firstName || !lastName) {
      throw new BadRequestException('Employee ID, first name, and last name cannot be blank.');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    try {
      // Self-registration always creates an employee; elevated roles remain admin-controlled.
      const user = await this.prisma.user.create({
        data: {
          employeeId,
          email,
          passwordHash,
          firstName,
          lastName,
          // Email delivery is intentionally deferred as P2; the account can sign in locally.
          emailVerifiedAt: new Date(),
        },
      });

      return { user: this.identity(user) };
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException('That email address or employee ID is already registered.');
      }
      throw error;
    }
  }

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

    const identity = this.identity(user);

    const accessToken = await this.jwtService.signAsync(
      { sub: identity.id, employeeId: identity.employeeId, email: identity.email, role: identity.role },
      { secret, expiresIn: '1h' },
    );

    return { accessToken, user: identity };
  }

  private identity(user: { id: string; employeeId: string; email: string; role: AuthenticatedUser['role'] }): AuthenticatedUser {
    // Returning this small identity prevents password hashes and private profile data from leaking.
    return {
      id: user.id,
      employeeId: user.employeeId,
      email: user.email,
      role: user.role,
    };
  }
}
