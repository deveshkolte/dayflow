import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsObject, IsOptional, Min } from 'class-validator';

// UpdateSalaryStructureDto describes a new effective salary version for an employee.
export class UpdateSalaryStructureDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  baseSalary!: number;

  @IsOptional()
  @IsObject()
  allowances?: Record<string, unknown>;

  @IsDateString()
  effectiveFrom!: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;
}
