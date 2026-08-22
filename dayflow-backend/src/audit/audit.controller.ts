import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuditService } from './audit.service';

// AuditController limits audit history to HR/Admin users because it may contain sensitive HR actions.
// Routes exposed: GET /api/admin/audit-logs, GET /api/audit-logs, GET /api/admin/audit, GET /api/audit
@Controller(['admin/audit-logs', 'audit-logs', 'admin/audit', 'audit'])
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.HR, Role.ADMIN)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async list(
    @Query('action') action?: string,
    @Query('entity') entity?: string,
    @Query('actorId') actorId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return {
      success: true,
      data: await this.auditService.findAll({
        action,
        entity,
        actorId,
        from,
        to,
        page,
        pageSize: pageSize || limit,
        search,
      }),
    };
  }
}
