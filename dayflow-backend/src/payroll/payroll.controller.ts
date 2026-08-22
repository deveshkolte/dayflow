import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from '../auth/auth.types';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateSalaryStructureDto } from './dto/update-salary-structure.dto';
import { PayrollService } from './payroll.service';

// PayrollController exposes employee payroll visibility and HR/Admin salary management.
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Get('payroll/me')
  async mine(@Req() request: AuthenticatedRequest) {
    return { success: true, data: await this.payrollService.findMine(request.user.id) };
  }

  @Get('admin/payroll')
  @Roles(Role.HR, Role.ADMIN)
  async all() {
    return { success: true, data: await this.payrollService.findAll() };
  }

  @Patch('admin/employees/:id/salary-structure')
  @Roles(Role.HR, Role.ADMIN)
  async updateSalary(
    @Param('id') employeeId: string,
    @Body() input: UpdateSalaryStructureDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return {
      success: true,
      data: await this.payrollService.updateSalary(employeeId, request.user, input),
    };
  }
}
