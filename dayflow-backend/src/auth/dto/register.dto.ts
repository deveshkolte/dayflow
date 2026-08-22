import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

// RegisterDto accepts only fields an employee is allowed to choose during sign-up.
export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  employeeId!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  lastName?: string;
}
