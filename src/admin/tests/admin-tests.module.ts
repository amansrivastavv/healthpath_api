import { Module } from '@nestjs/common';
import { AdminTestsService } from './admin-tests.service';
import { AdminTestsController } from './admin-tests.controller';
import { AdminAuthModule } from '../auth/admin-auth.module';

@Module({
  imports: [AdminAuthModule],
  controllers: [AdminTestsController],
  providers: [AdminTestsService],
})
export class AdminTestsModule {}
