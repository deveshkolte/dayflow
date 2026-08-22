import { Role } from '@prisma/client';

// This is the trusted identity attached to a request after JWT validation.
export interface AuthenticatedUser {
  id: string;
  employeeId: string;
  email: string;
  role: Role;
}

// Nest request objects receive the authenticated identity from JwtAuthGuard.
export interface AuthenticatedRequest {
  headers: { authorization?: string };
  user: AuthenticatedUser;
}
