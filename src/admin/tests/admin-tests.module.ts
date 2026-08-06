import { Module } from '@nestjs/common';
import { AdminTestsController } from './admin-tests.controller';

@Module({
  controllers: [AdminTestsController],
})
export class AdminTestsModule {}
