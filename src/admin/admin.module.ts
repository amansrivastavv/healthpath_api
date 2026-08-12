import { Module } from '@nestjs/common';
import { AdminAuthModule } from './auth/admin-auth.module';
import { AdminDashboardModule } from './dashboard/admin-dashboard.module';
import { AdminUsersModule } from './users/admin-users.module';
import { AdminProvidersModule } from './providers/admin-providers.module';
import { AdminSpecializationsModule } from './specializations/admin-specializations.module';
import { AdminTestsModule } from './tests/admin-tests.module';
import { AdminBookingsModule } from './bookings/admin-bookings.module';
import { AdminReportsModule } from './reports/admin-reports.module';
import { AdminNotificationsModule } from './notifications/admin-notifications.module';
import { AdminSettingsModule } from './settings/admin-settings.module';

/**
 * Aggregate module for all admin feature modules.
 * Used by Swagger's `include` option to scope the Admin API documentation.
 *
 * Each sub-module contains its own controllers, services, and DTOs.
 * Shared dependencies (Prisma, Mail, R2, etc.) are provided globally
 * through the root AppModule.
 */
@Module({
  imports: [
    AdminAuthModule,
    AdminDashboardModule,
    AdminUsersModule,
    AdminProvidersModule,
    AdminSpecializationsModule,
    AdminTestsModule,
    AdminBookingsModule,
    AdminReportsModule,
    AdminNotificationsModule,
    AdminSettingsModule,
  ],
})
export class AdminModule {}
