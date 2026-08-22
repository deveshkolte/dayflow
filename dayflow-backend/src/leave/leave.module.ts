import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LeaveController } from './leave.controller';
import { LeaveService } from './leave.service';

// LeaveModule keeps leave validation, authorization, persistence, and audit behavior together.
@Module({
  imports: [AuthModule],
  controllers: [LeaveController],
  providers: [LeaveService],
})
export class LeaveModule {}
