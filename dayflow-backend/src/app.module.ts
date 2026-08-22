import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';
import { LeaveModule } from './leave/leave.module';
import { EmployeeModule } from './employee/employee.module';
import { AttendanceModule } from './attendance/attendance.module';
import { PayrollModule } from './payroll/payroll.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [PrismaModule, AuthModule, LeaveModule, EmployeeModule, AttendanceModule, PayrollModule, AuditModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
