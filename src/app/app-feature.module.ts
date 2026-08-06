import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';

/**
 * Aggregate module for all patient-facing (App) feature modules.
 * Used by Swagger's `include` option to scope the Patient API documentation.
 *
 * Add new patient modules here as they are implemented:
 * - AppProvidersModule
 * - AppTestsModule
 * - AppBookingsModule
 * - AppReportsModule
 * - AppNotificationsModule
 */
@Module({
  imports: [AuthModule, ProfileModule],
  exports: [AuthModule],
})
export class AppFeatureModule {}
