import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

// Employees may change only the profile fields allowed by the HRMS requirements.
export class UpdateOwnProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  address?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  profilePictureUrl?: string;
}
