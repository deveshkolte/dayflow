import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

// The RolesGuard reads this metadata before protected controller methods run.
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
