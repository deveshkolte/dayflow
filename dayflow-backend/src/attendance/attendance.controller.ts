import { Controller, Get, ParseEnumPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AttendanceStatus, Role } from '@prisma/client';
import { AuthenticatedRequest } from '../auth/auth.types';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AttendanceService } from './attendance.service';

// AttendanceController exposes employee self-service and HR/Admin attendance views.
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // Check-in and check-out are separate actions so the server controls their timestamps.
  @Post('attendance/check-in')
  async checkIn(@Req() request: AuthenticatedRequest) {
    return { success: true, data: await this.attendanceService.checkIn(request.user) };
  }

  @Post('attendance/check-out')
  async checkOut(@Req() request: AuthenticatedRequest) {
    return { success: true, data: await this.attendanceService.checkOut(request.user) };
  }

  @Get('attendance/me')
  async mine(
    @Req() request: AuthenticatedRequest,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return {
      success: true,
      data: await this.attendanceService.findMine(request.user.id, startDate, endDate),
    };
  }

  @Get('admin/attendance')
  @Roles(Role.HR, Role.ADMIN)
  async all(
    @Query('date') date?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status', new ParseEnumPipe(AttendanceStatus, { optional: true })) status?: AttendanceStatus,
    @Query('employeeId') employeeId?: string,
    @Query('search') search?: string,
  ) {
    return {
      success: true,
      data: await this.attendanceService.findAll({ date, startDate, endDate, status, employeeId, search }),
    };
  }
}
