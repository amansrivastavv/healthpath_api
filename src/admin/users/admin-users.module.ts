import { Module } from '@nestjs/common';
import { AdminAuthModule } from '../auth/admin-auth.module';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  imports: [AdminAuthModule],
  controllers: [AdminUsersController],
  providers: [AdminUsersService, RolesGuard],
  exports: [AdminUsersService],
})
export class AdminUsersModule {}
