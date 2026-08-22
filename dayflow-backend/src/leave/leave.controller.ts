import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  ParseEnumPipe,
  UseGuards,
} from '@nestjs/common';
import { LeaveStatus, LeaveType, Role } from '@prisma/client';
import { AuthenticatedRequest } from '../auth/auth.types';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { LeaveDecisionDto } from './dto/leave-decision.dto';
import { LeaveService } from './leave.service';

// LeaveController maps the employee and HR/Admin leave workflows to predictable API routes.
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post(['leave', 'leaves'])
  async create(@Req() request: AuthenticatedRequest, @Body() input: CreateLeaveRequestDto) {
    const data = await this.leaveService.create(request.user, input);
    return { success: true, data, leave: data };
  }

  @Get(['leave/me', 'leaves'])
  async mine(@Req() request: AuthenticatedRequest) {
    const data = await this.leaveService.findMine(request.user.id);
    return { success: true, data, leaves: data };
  }

  @Get(['admin/leave', 'admin/leaves'])
  @Roles(Role.HR, Role.ADMIN)
  async all(
    @Query('status', new ParseEnumPipe(LeaveStatus, { optional: true })) status?: LeaveStatus,
    @Query('type', new ParseEnumPipe(LeaveType, { optional: true })) type?: LeaveType,
    @Query('employeeId') employeeId?: string,
    @Query('search') search?: string,
  ) {
    return { success: true, data: await this.leaveService.findAll(status, type, employeeId, search) };
  }

  @Patch(['admin/leave/:id/decision', 'admin/leaves/:id/decision'])
  @Roles(Role.HR, Role.ADMIN)
  async decide(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
    @Body() input: LeaveDecisionDto,
  ) {
    return { success: true, data: await this.leaveService.decide(id, request.user, input) };
  }
}
