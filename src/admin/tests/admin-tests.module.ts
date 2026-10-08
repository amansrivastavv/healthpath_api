import { Module } from '@nestjs/common';
import { AdminTestsService } from './admin-tests.service';
import { AdminTestsController } from './admin-tests.controller';

@Module({
  controllers: [AdminTestsController],
  providers: [AdminTestsService],
})
export class AdminTestsModule {}
