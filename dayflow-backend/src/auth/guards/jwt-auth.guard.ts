import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma.service';
import { AuthenticatedRequest, AuthenticatedUser } from '../auth.types';

// JwtAuthGuard authenticates every protected request and confirms the account is still active.
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('A bearer access token is required.');
    }

    const token = authorization.slice('Bearer '.length).trim();
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new UnauthorizedException('Authentication is not configured.');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        role: AuthenticatedUser['role'];
        employeeId: string;
        email: string;
      }>(token, { secret });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, employeeId: true, email: true, role: true, isActive: true },
      });

      if (!user?.isActive) {
        throw new UnauthorizedException('This account is inactive.');
      }

      // The role is read from the database so a changed role takes effect immediately.
      request.user = {
        id: user.id,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('The access token is invalid or expired.');
    }
  }
}
