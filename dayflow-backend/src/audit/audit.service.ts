import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

interface AuditQuery {
  action?: string;
  entity?: string;
  actorId?: string;
  from?: string;
  to?: string;
  page?: string;
  pageSize?: string;
  search?: string;
}

// AuditService provides bounded, filterable history without exposing password or profile secrets.
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: AuditQuery) {
    const page = this.parsePositiveInteger(query.page, 1, 'page');
    const pageSize = Math.min(this.parsePositiveInteger(query.pageSize, 50, 'pageSize'), 100);
    const from = query.from ? this.parseDate(query.from, 'from') : undefined;
    const to = query.to ? this.parseDate(query.to, 'to') : undefined;

    if (from && to && from > to) {
      throw new BadRequestException('to cannot precede from.');
    }

    const createdAt: Prisma.DateTimeFilter = {};
    if (from) createdAt.gte = from;
    if (to) {
      // The end date is inclusive for callers, so query until the next UTC calendar day.
      const nextDay = new Date(to);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      createdAt.lt = nextDay;
    }

    const search = query.search?.trim();

    const where: Prisma.AuditLogWhereInput = {
      action: query.action?.trim() || undefined,
      entity: query.entity?.trim() || undefined,
      actorId: query.actorId?.trim() || undefined,
      createdAt: Object.keys(createdAt).length ? createdAt : undefined,
      OR: search
        ? [
            { action: { contains: search, mode: 'insensitive' } },
            { entity: { contains: search, mode: 'insensitive' } },
            { actor: { firstName: { contains: search, mode: 'insensitive' } } },
            { actor: { lastName: { contains: search, mode: 'insensitive' } } },
            { actor: { employeeId: { contains: search, mode: 'insensitive' } } },
          ]
        : undefined,
    };

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: { actor: { select: { id: true, employeeId: true, firstName: true, lastName: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items: logs.map((log) => ({
        id: log.id,
        action: log.action,
        entity: log.entity,
        metadata: log.metadata,
        createdAt: log.createdAt.toISOString(),
        actor: log.actor
          ? {
              id: log.actor.id,
              employeeId: log.actor.employeeId,
              fullName: [log.actor.firstName, log.actor.lastName].filter(Boolean).join(' ') || log.actor.employeeId,
              role: log.actor.role,
            }
          : null,
      })),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  private parsePositiveInteger(value: string | undefined, fallback: number, fieldName: string) {
    if (value === undefined) return fallback;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) {
      throw new BadRequestException(`${fieldName} must be a positive integer.`);
    }
    return parsed;
  }

  private parseDate(value: string, fieldName: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new BadRequestException(`${fieldName} must use YYYY-MM-DD format.`);
    }

    const parsed = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
      throw new BadRequestException(`${fieldName} is not a valid calendar date.`);
    }
    return parsed;
  }
}
