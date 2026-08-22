import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';

// EmployeeModule contains the profile and directory functionality required by P0.
@Module({
  imports: [AuthModule],
  controllers: [EmployeeController],
  providers: [EmployeeService],
})
export class EmployeeModule {}
