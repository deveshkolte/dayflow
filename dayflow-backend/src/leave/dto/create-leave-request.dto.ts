import { LeaveType } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

// CreateLeaveRequestDto validates the employee-controlled part of a leave request.
export class CreateLeaveRequestDto {
  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsEnum(LeaveType)
  type!: LeaveType;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
