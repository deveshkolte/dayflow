import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma.service';
import { UpdateSalaryStructureDto } from './dto/update-salary-structure.dto';

// PayrollService reads payroll history and creates append-only salary versions.
@Injectable()
export class PayrollService {
  constructor(private readonly prisma: PrismaService) {}

  async findMine(employeeId: string) {
    const [payroll, salaryStructures] = await Promise.all([
      this.prisma.payrollRecord.findMany({
        where: { employeeId },
        orderBy: { periodStart: 'desc' },
      }),
      this.prisma.salaryStructure.findMany({
        where: { employeeId },
        orderBy: { effectiveFrom: 'desc' },
      }),
    ]);

    return {
      payroll: payroll.map((record) => this.serializePayroll(record)),
      salaryStructures: salaryStructures.map((salary) => this.serializeSalary(salary)),
    };
  }

  async findAll() {
    const records = await this.prisma.payrollRecord.findMany({
      include: { employee: true },
      orderBy: [{ periodStart: 'desc' }, { createdAt: 'desc' }],
    });

    return records.map((record) => ({
      ...this.serializePayroll(record),
      employee: {
        id: record.employee.id,
        employeeId: record.employee.employeeId,
        fullName: [record.employee.firstName, record.employee.lastName].filter(Boolean).join(' ') || record.employee.employeeId,
      },
    }));
  }

  async updateSalary(employeeId: string, actor: AuthenticatedUser, input: UpdateSalaryStructureDto) {
    const effectiveFrom = this.parseDateOnly(input.effectiveFrom, 'effectiveFrom');
    const effectiveTo = input.effectiveTo
      ? this.parseDateOnly(input.effectiveTo, 'effectiveTo')
      : null;

    if (effectiveTo && effectiveTo < effectiveFrom) {
      throw new BadRequestException('effectiveTo cannot precede effectiveFrom.');
    }

    const employee = await this.prisma.user.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Employee profile not found.');

    const salary = await this.prisma.$transaction(async (transaction) => {
      const created = await transaction.salaryStructure.create({
        data: {
          employeeId,
          baseSalary: input.baseSalary,
          allowances: input.allowances as Prisma.InputJsonValue | undefined,
          effectiveFrom,
          effectiveTo,
        },
      });

      // Salary changes are important administrative mutations, so record the actor with them.
      await transaction.auditLog.create({
        data: {
          actorId: actor.id,
          action: 'SALARY_STRUCTURE_UPDATED',
          entity: 'SalaryStructure',
          metadata: {
            employeeId,
            salaryStructureId: created.id,
            effectiveFrom: input.effectiveFrom,
          } as Prisma.InputJsonValue,
        },
      });

      return created;
    });

    return this.serializeSalary(salary);
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

  private serializeSalary(salary: any) {
    return {
      id: salary.id,
      baseSalary: Number(salary.baseSalary),
      allowances: salary.allowances ?? {},
      effectiveFrom: salary.effectiveFrom.toISOString().slice(0, 10),
      effectiveTo: salary.effectiveTo?.toISOString().slice(0, 10) ?? null,
    };
  }

  private serializePayroll(record: any) {
    return {
      id: record.id,
      periodStart: record.periodStart.toISOString().slice(0, 10),
      periodEnd: record.periodEnd.toISOString().slice(0, 10),
      gross: Number(record.gross),
      net: Number(record.net),
      deductions: record.deductions ?? {},
      createdAt: record.createdAt.toISOString(),
    };
  }
}
