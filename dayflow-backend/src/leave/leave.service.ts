import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LeaveRequest, LeaveStatus, LeaveType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { AuthenticatedUser } from '../auth/auth.types';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { LeaveDecisionDto } from './dto/leave-decision.dto';

// LeaveService contains the persisted leave workflow and its business rules.
@Injectable()
export class LeaveService {
  constructor(private readonly prisma: PrismaService) {}

  async create(employee: AuthenticatedUser, input: CreateLeaveRequestDto) {
    const startDate = this.parseDateOnly(input.startDate, 'startDate');
    const endDate = this.parseDateOnly(input.endDate, 'endDate');

    if (startDate > endDate) {
      throw new BadRequestException('The leave end date cannot precede the start date.');
    }

    const rawType = (input.type || input.leaveType || 'PAID').toString().toUpperCase();
    let leaveType: LeaveType = LeaveType.PAID;
    if (rawType === 'SICK') leaveType = LeaveType.SICK;
    else if (rawType === 'UNPAID' || rawType === 'EMERGENCY') leaveType = LeaveType.UNPAID;
    else leaveType = LeaveType.PAID;

    const duplicate = await this.prisma.leaveRequest.findFirst({
      where: {
        employeeId: employee.id,
        startDate,
        endDate,
        type: leaveType,
        status: LeaveStatus.PENDING,
      },
    });

    if (duplicate) {
      throw new ConflictException('An identical pending leave request already exists.');
    }

    // Persist the request and its audit event together so the workflow is traceable.
    const leaveRequest = await this.prisma.$transaction(async (transaction) => {
      const created = await transaction.leaveRequest.create({
        data: {
          employeeId: employee.id,
          startDate,
          endDate,
          type: leaveType,
          reason: input.reason?.trim() || null,
        },
        include: { employee: true },
      });

      await transaction.auditLog.create({
        data: {
          actorId: employee.id,
          action: 'LEAVE_SUBMITTED',
          entity: 'LeaveRequest',
          metadata: {
            leaveRequestId: created.id,
            employeeId: employee.id,
            startDate: input.startDate,
            endDate: input.endDate,
            type: leaveType,
          } as Prisma.InputJsonValue,
        },
      });

      return created;
    });

    return this.serialize(leaveRequest);
  }

  async findMine(employeeId: string) {
    const requests = await this.prisma.leaveRequest.findMany({
      where: { employeeId },
      include: { employee: true, approver: true },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((request) => this.serialize(request));
  }

  async findAll(status?: LeaveStatus, type?: LeaveType, employeeId?: string, search?: string) {
    const searchTerm = search?.trim();
    const requests = await this.prisma.leaveRequest.findMany({
      where: {
        status,
        type,
        employeeId,
        OR: searchTerm
          ? [
              { employee: { firstName: { contains: searchTerm, mode: 'insensitive' } } },
              { employee: { lastName: { contains: searchTerm, mode: 'insensitive' } } },
              { employee: { employeeId: { contains: searchTerm, mode: 'insensitive' } } },
              { reason: { contains: searchTerm, mode: 'insensitive' } },
            ]
          : undefined,
      },
      include: { employee: true, approver: true },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((request) => this.serialize(request));
  }

  async decide(id: string, actor: AuthenticatedUser, input: LeaveDecisionDto) {
    const status = input.decision === 'APPROVE' ? LeaveStatus.APPROVED : LeaveStatus.REJECTED;

    const result = await this.prisma.$transaction(async (transaction) => {
      const request = await transaction.leaveRequest.findUnique({
        where: { id },
        include: { employee: true, approver: true },
      });

      if (!request) {
        throw new NotFoundException('Leave request not found.');
      }

      if (request.status !== LeaveStatus.PENDING) {
        throw new ConflictException('This leave request has already been finalized.');
      }

      if (request.employeeId === actor.id) {
        throw new BadRequestException('An employee cannot approve their own leave request.');
      }

      const updated = await transaction.leaveRequest.update({
        where: { id },
        data: {
          status,
          approverId: actor.id,
          approverComment: input.comment?.trim() || null,
        },
        include: { employee: true, approver: true },
      });

      // The audit row is written in the same transaction as the decision.
      await transaction.auditLog.create({
        data: {
          actorId: actor.id,
          action: status === LeaveStatus.APPROVED ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED',
          entity: 'LeaveRequest',
          metadata: {
            leaveRequestId: id,
            employeeId: request.employeeId,
            previousStatus: request.status,
            newStatus: status,
            comment: input.comment?.trim() || null,
          } as Prisma.InputJsonValue,
        },
      });

      return updated;
    });

    return this.serialize(result);
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

  private serialize(
    request: LeaveRequest & {
      employee?: { id: string; employeeId: string; email?: string | null; firstName: string | null; lastName: string | null };
      approver?: { firstName: string | null; lastName: string | null } | null;
    },
  ) {
    const formattedType = request.type === 'PAID' ? 'Casual' : request.type === 'SICK' ? 'Sick' : 'Unpaid';
    const statusLower = request.status.toLowerCase();

    return {
      id: request.id,
      userId: request.employeeId,
      employeeId: request.employee?.employeeId ?? request.employeeId,
      employeeName: request.employee ? this.fullName(request.employee.firstName, request.employee.lastName) : null,
      email: request.employee?.email ?? null,
      type: request.type,
      leaveType: formattedType,
      startDate: request.startDate.toISOString().slice(0, 10),
      endDate: request.endDate.toISOString().slice(0, 10),
      status: request.status,
      statusLower,
      reason: request.reason ?? '',
      remarks: request.reason ?? '',
      approverComment: request.approverComment,
      adminComment: request.approverComment,
      approverName: request.approver ? this.fullName(request.approver.firstName, request.approver.lastName) : null,
      createdAt: request.createdAt.toISOString(),
      appliedOn: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
    };
  }

  private fullName(firstName: string | null, lastName: string | null) {
    return [firstName, lastName].filter(Boolean).join(' ') || 'Unnamed employee';
  }
}
