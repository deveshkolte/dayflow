import { BadRequestException, Body, Controller, Get, Param, ParseEnumPipe, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from '../auth/auth.types';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UpdateOwnProfileDto } from './dto/update-own-profile.dto';
import { EmployeeService } from './employee.service';

// EmployeeController separates self-service profile access from HR/Admin directory access.
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get('employees/me')
  getMine(@Req() request: AuthenticatedRequest) {
    return this.employeeService.findMine(request.user.id).then((data) => ({ success: true, data }));
  }

  @Patch('employees/me')
  updateMine(@Req() request: AuthenticatedRequest, @Body() input: UpdateOwnProfileDto) {
    return this.employeeService.updateMine(request.user.id, input).then((data) => ({ success: true, data }));
  }

  @Get('admin/employees')
  @Roles(Role.HR, Role.ADMIN)
  findAll(
    @Query('search') search?: string,
    @Query('department') department?: string,
    @Query('isActive') isActive?: string,
    @Query('role', new ParseEnumPipe(Role, { optional: true })) role?: Role,
  ) {
    if (isActive !== undefined && isActive !== 'true' && isActive !== 'false') {
      throw new BadRequestException('isActive must be true or false.');
    }

    const activeFilter = isActive === undefined ? undefined : isActive === 'true';
    return this.employeeService.findAll(search?.trim(), department?.trim(), activeFilter, role).then((data) => ({ success: true, data }));
  }

  @Get('admin/employees/:id')
  @Roles(Role.HR, Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.employeeService.findMine(id).then((data) => ({ success: true, data }));
  }

  @Patch('admin/employees/:id')
  @Roles(Role.HR, Role.ADMIN)
  updateOne(@Param('id') id: string, @Body() input: UpdateEmployeeDto, @Req() request: AuthenticatedRequest) {
    return this.employeeService.updateByAdmin(id, input, request.user).then((data) => ({ success: true, data }));
  }
}
