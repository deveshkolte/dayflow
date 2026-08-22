import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';

// AuditModule exposes read-only administrative history over the existing AuditLog table.
@Module({
  imports: [AuthModule],
  controllers: [AuditController],
  providers: [AuditService],
})
export class AuditModule {}
