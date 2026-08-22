import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AttendanceStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { AuthenticatedUser } from '../auth/auth.types';

// AttendanceService keeps date parsing and check-in state transitions on the server.
@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async checkIn(employee: AuthenticatedUser) {
    const date = this.today();
    const existing = await this.prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId: employee.id, date } },
    });

    if (existing?.checkIn) {
      throw new ConflictException('You have already checked in today.');
    }

    try {
      // The unique database constraint protects against two check-in requests arriving together.
      const record = existing
        ? await this.prisma.attendance.update({
            where: { id: existing.id },
            data: { checkIn: new Date(), status: AttendanceStatus.PRESENT },
            include: { employee: true },
          })
        : await this.prisma.attendance.create({
            data: {
              employeeId: employee.id,
              date,
              checkIn: new Date(),
              status: AttendanceStatus.PRESENT,
            },
            include: { employee: true },
          });

      return this.serialize(record);
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException('You have already checked in today.');
      }
      throw error;
    }
  }

  async checkOut(employee: AuthenticatedUser) {
    const date = this.today();
    const existing = await this.prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId: employee.id, date } },
      include: { employee: true },
    });

    if (!existing) {
      throw new NotFoundException('Check in before checking out.');
    }

    if (!existing.checkIn) {
      throw new BadRequestException('Check in before checking out.');
    }

    if (existing.checkOut) {
      throw new ConflictException('You have already checked out today.');
    }

    const updated = await this.prisma.attendance.update({
      where: { id: existing.id },
      data: { checkOut: new Date() },
      include: { employee: true },
    });

    return this.serialize(updated);
  }

  async findMine(employeeId: string, startDate?: string, endDate?: string) {
    const dateFilter = this.dateRange(startDate, endDate);
    const records = await this.prisma.attendance.findMany({
      where: { employeeId, date: dateFilter },
      include: { employee: true },
      orderBy: { date: 'desc' },
    });

    return records.map((record) => this.serialize(record));
  }

  async findAll(filters: {
    date?: string;
    startDate?: string;
    endDate?: string;
    status?: AttendanceStatus;
    employeeId?: string;
    search?: string;
  } = {}) {
    const { date, startDate, endDate, status, employeeId, search } = filters;
    const dateFilter = date ? this.dateRange(date, date) : this.dateRange(startDate, endDate);
    const searchTerm = search?.trim();

    const records = await this.prisma.attendance.findMany({
      where: {
        employeeId,
        status,
        date: dateFilter,
        OR: searchTerm
          ? [
              { employee: { firstName: { contains: searchTerm, mode: 'insensitive' } } },
              { employee: { lastName: { contains: searchTerm, mode: 'insensitive' } } },
              { employee: { employeeId: { contains: searchTerm, mode: 'insensitive' } } },
            ]
          : undefined,
      },
      include: { employee: true },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });

    return records.map((record) => this.serialize(record));
  }

  private today() {
    return this.parseDateOnly(new Date().toISOString().slice(0, 10), 'date');
  }

  private dateRange(startDate?: string, endDate?: string): Prisma.DateTimeFilter | undefined {
    if (!startDate && !endDate) return undefined;

    const range: Prisma.DateTimeFilter = {};
    if (startDate) range.gte = this.parseDateOnly(startDate, 'startDate');
    if (endDate) range.lte = this.parseDateOnly(endDate, 'endDate');
    if (range.gte && range.lte && range.gte > range.lte) {
      throw new BadRequestException('endDate cannot precede startDate.');
    }
    return range;
  }

  private parseDateOnly(value: string, fieldName: string): Date {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new BadRequestException(`${fieldName} must use YYYY-MM-DD format.`);
    }

    const parsed = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
      throw new BadRequestException(`${fieldName} is not a valid calendar date.`);
    }
    return parsed;
  }

  private serialize(record: any) {
    return {
      id: record.id,
      employeeId: record.employee.employeeId,
      employeeName: [record.employee.firstName, record.employee.lastName].filter(Boolean).join(' ') || record.employee.employeeId,
      date: record.date.toISOString().slice(0, 10),
      checkIn: record.checkIn?.toISOString() ?? null,
      checkOut: record.checkOut?.toISOString() ?? null,
      status: record.status,
      notes: record.notes,
    };
  }
}
