import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';
import { LeaveModule } from './leave/leave.module';

@Module({
  imports: [PrismaModule, AuthModule, LeaveModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
