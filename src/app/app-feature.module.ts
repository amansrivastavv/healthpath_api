import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { AppProvidersModule } from './providers/app-providers.module';
import { AppDoctorsModule } from './doctors/app-doctors.module';
import { AppSpecializationsModule } from './specializations/app-specializations.module';
import { AppConditionsModule } from './conditions/app-conditions.module';
import { AppTestsModule } from './tests/app-tests.module';
import { AppTrendingModule } from './trending/app-trending.module';

/**
 * Aggregate module for all patient-facing (App) feature modules.
 * Used by Swagger's `include` option to scope the Patient API documentation.
 */
@Module({
  imports: [
    AuthModule,
    ProfileModule,
    AppProvidersModule,
    AppDoctorsModule,
    AppSpecializationsModule,
    AppConditionsModule,
    AppTestsModule,
    AppTrendingModule,
  ],
  exports: [
    AuthModule,
    AppProvidersModule,
    AppDoctorsModule,
    AppSpecializationsModule,
    AppConditionsModule,
    AppTestsModule,
    AppTrendingModule,
  ],
})
export class AppFeatureModule {}
