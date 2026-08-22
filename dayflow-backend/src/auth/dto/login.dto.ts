import { IsEmail, IsString, MinLength } from 'class-validator';

// Login accepts only the credentials needed to establish an authenticated session.
export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
