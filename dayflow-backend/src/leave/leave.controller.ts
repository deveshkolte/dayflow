import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
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

  @Post('leave')
  async create(@Req() request: AuthenticatedRequest, @Body() input: CreateLeaveRequestDto) {
    return { success: true, data: await this.leaveService.create(request.user, input) };
  }

  @Get('leave/me')
  async mine(@Req() request: AuthenticatedRequest) {
    return { success: true, data: await this.leaveService.findMine(request.user.id) };
  }

  @Get('admin/leave')
  @Roles(Role.HR, Role.ADMIN)
  async all(@Query('status') status?: LeaveStatus, @Query('type') type?: LeaveType) {
    return { success: true, data: await this.leaveService.findAll(status, type) };
  }

  @Patch('admin/leave/:id/decision')
  @Roles(Role.HR, Role.ADMIN)
  async decide(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
    @Body() input: LeaveDecisionDto,
  ) {
    return { success: true, data: await this.leaveService.decide(id, request.user, input) };
  }
}
