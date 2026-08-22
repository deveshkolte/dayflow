import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

// Only these two transitions are valid from the PENDING state.
export class LeaveDecisionDto {
  @IsIn(['APPROVE', 'REJECT'])
  decision!: 'APPROVE' | 'REJECT';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}
