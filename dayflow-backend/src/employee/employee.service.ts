import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthenticatedUser } from '../auth/auth.types';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UpdateOwnProfileDto } from './dto/update-own-profile.dto';

// EmployeeService owns profile visibility, HR/Admin directory queries, and safe profile updates.
@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}

  async findMine(userId: string) {
    const employee = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { documents: true, salaryStructures: { orderBy: { effectiveFrom: 'desc' }, take: 1 } },
    });

    if (!employee) throw new NotFoundException('Employee profile not found.');
    return this.serialize(employee);
  }

  async updateMine(userId: string, input: UpdateOwnProfileDto) {
    const employee = await this.prisma.user.update({
      where: { id: userId },
      data: input,
      include: { documents: true, salaryStructures: { orderBy: { effectiveFrom: 'desc' }, take: 1 } },
    });

    return this.serialize(employee);
  }

  async findAll(search?: string, department?: string, isActive?: boolean) {
    const employees = await this.prisma.user.findMany({
      where: {
        isActive,
        department: department || undefined,
        OR: search
          ? [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { employeeId: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      include: { documents: true, salaryStructures: { orderBy: { effectiveFrom: 'desc' }, take: 1 } },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });

    return employees.map((employee) => this.serialize(employee));
  }

  async updateByAdmin(id: string, input: UpdateEmployeeDto) {
    try {
      const employee = await this.prisma.user.update({
        where: { id },
        data: { ...input, email: input.email?.trim().toLowerCase() },
        include: { documents: true, salaryStructures: { orderBy: { effectiveFrom: 'desc' }, take: 1 } },
      });

      return this.serialize(employee);
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException('That email address is already in use.');
      }

      if ((error as { code?: string }).code === 'P2025') {
        throw new NotFoundException('Employee profile not found.');
      }

      throw error;
    }
  }

  private serialize(employee: any) {
    const salary = employee.salaryStructures[0];
    const allowances = salary?.allowances && typeof salary.allowances === 'object' ? salary.allowances : {};

    return {
      id: employee.id,
      employeeId: employee.employeeId,
      email: employee.email,
      firstName: employee.firstName,
      lastName: employee.lastName,
      fullName: [employee.firstName, employee.lastName].filter(Boolean).join(' ') || employee.employeeId,
      phone: employee.phone,
      address: employee.address,
      department: employee.department,
      jobTitle: employee.jobTitle,
      role: employee.role,
      isActive: employee.isActive,
      profilePictureUrl: employee.profilePictureUrl,
      createdAt: employee.createdAt,
      documents: employee.documents.map((document: { id: string; type: string; url: string; uploadedAt: Date }) => ({
        id: document.id,
        type: document.type,
        url: document.url,
        uploadedAt: document.uploadedAt,
      })),
      salaryStructure: salary
        ? {
            baseSalary: Number(salary.baseSalary),
            allowances,
            effectiveFrom: salary.effectiveFrom,
            effectiveTo: salary.effectiveTo,
          }
        : null,
    };
  }
}
