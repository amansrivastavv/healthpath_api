-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `phone_number` VARCHAR(191) NULL,
    `country_code` VARCHAR(191) NULL,
    `profile_image` VARCHAR(191) NULL,
    `role` ENUM('SUPER_ADMIN', 'ADMIN', 'LAB_OWNER', 'LAB_STAFF', 'TECHNICIAN', 'PATIENT') NOT NULL DEFAULT 'PATIENT',
    `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION') NOT NULL DEFAULT 'PENDING_VERIFICATION',
    `email_verified` BOOLEAN NOT NULL DEFAULT false,
    `phone_verified` BOOLEAN NOT NULL DEFAULT false,
    `password_reset_token` VARCHAR(191) NULL,
    `password_reset_expires` DATETIME(3) NULL,
    `last_login_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_phone_number_key`(`phone_number`),
    INDEX `users_email_idx`(`email`),
    INDEX `users_phone_number_idx`(`phone_number`),
    INDEX `users_role_idx`(`role`),
    INDEX `users_status_idx`(`status`),
    INDEX `users_password_reset_token_idx`(`password_reset_token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `providers` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `type` ENUM('INDIVIDUAL_DOCTOR', 'CLINIC', 'HOSPITAL', 'LAB', 'BOTH') NOT NULL,
    `description` TEXT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL DEFAULT 'India',
    `pincode` VARCHAR(191) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `established_year` INTEGER NULL,
    `emergency_available` BOOLEAN NOT NULL DEFAULT false,
    `available_24x7` BOOLEAN NOT NULL DEFAULT false,
    `parking_available` BOOLEAN NOT NULL DEFAULT false,
    `pharmacy_available` BOOLEAN NOT NULL DEFAULT false,
    `wheelchair_accessible` BOOLEAN NOT NULL DEFAULT false,
    `rating` DOUBLE NULL DEFAULT 0,
    `total_ratings` INTEGER NOT NULL DEFAULT 0,
    `opening_hours` JSON NULL,
    `home_collection_available` BOOLEAN NOT NULL DEFAULT false,
    `profile_image` VARCHAR(191) NULL,
    `cover_image` VARCHAR(191) NULL,
    `cover_images` JSON NOT NULL,
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `verification_status` ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_featured` BOOLEAN NOT NULL DEFAULT false,
    `owner_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `providers_slug_key`(`slug`),
    INDEX `providers_type_idx`(`type`),
    INDEX `providers_city_idx`(`city`),
    INDEX `providers_state_idx`(`state`),
    INDEX `providers_pincode_idx`(`pincode`),
    INDEX `providers_is_verified_idx`(`is_verified`),
    INDEX `providers_verification_status_idx`(`verification_status`),
    INDEX `providers_is_active_idx`(`is_active`),
    INDEX `providers_is_featured_idx`(`is_featured`),
    INDEX `providers_rating_idx`(`rating`),
    INDEX `providers_owner_id_idx`(`owner_id`),
    INDEX `providers_latitude_longitude_idx`(`latitude`, `longitude`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `specializations` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `specializations_name_key`(`name`),
    UNIQUE INDEX `specializations_slug_key`(`slug`),
    INDEX `specializations_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `doctors` (
    `id` VARCHAR(191) NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `profile_image` VARCHAR(191) NULL,
    `specialization_id` VARCHAR(191) NOT NULL,
    `qualification` VARCHAR(191) NOT NULL,
    `experience_years` INTEGER NOT NULL DEFAULT 0,
    `medical_registration_number` VARCHAR(191) NOT NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
    `languages` JSON NOT NULL,
    `about` TEXT NULL,
    `consultation_fee` DOUBLE NOT NULL DEFAULT 0,
    `online_consultation_fee` DOUBLE NULL,
    `in_person_consultation_fee` DOUBLE NULL,
    `home_visit_fee` DOUBLE NULL,
    `consultation_types` JSON NOT NULL,
    `provider_id` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `verification_status` ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `doctors_medical_registration_number_key`(`medical_registration_number`),
    INDEX `doctors_provider_id_idx`(`provider_id`),
    INDEX `doctors_specialization_id_idx`(`specialization_id`),
    INDEX `doctors_is_active_idx`(`is_active`),
    INDEX `doctors_verification_status_idx`(`verification_status`),
    INDEX `doctors_medical_registration_number_idx`(`medical_registration_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `doctor_availabilities` (
    `id` VARCHAR(191) NOT NULL,
    `doctor_id` VARCHAR(191) NOT NULL,
    `day_of_week` ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NOT NULL,
    `start_time` VARCHAR(191) NOT NULL,
    `end_time` VARCHAR(191) NOT NULL,
    `slot_duration` INTEGER NOT NULL DEFAULT 30,
    `break_start` VARCHAR(191) NULL,
    `break_end` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `doctor_availabilities_doctor_id_idx`(`doctor_id`),
    INDEX `doctor_availabilities_day_of_week_idx`(`day_of_week`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verification_documents` (
    `id` VARCHAR(191) NOT NULL,
    `provider_id` VARCHAR(191) NULL,
    `doctor_id` VARCHAR(191) NULL,
    `document_type` ENUM('DOCTOR_REGISTRATION', 'QUALIFICATION_CERTIFICATE', 'ID_PROOF', 'FACILITY_REGISTRATION', 'LICENSE', 'ACCREDITATION', 'OTHER') NOT NULL,
    `document_url` VARCHAR(191) NOT NULL,
    `notes` VARCHAR(191) NULL,
    `uploaded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `verification_status` ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `verification_documents_provider_id_idx`(`provider_id`),
    INDEX `verification_documents_doctor_id_idx`(`doctor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `providers` ADD CONSTRAINT `providers_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctors` ADD CONSTRAINT `doctors_specialization_id_fkey` FOREIGN KEY (`specialization_id`) REFERENCES `specializations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctors` ADD CONSTRAINT `doctors_provider_id_fkey` FOREIGN KEY (`provider_id`) REFERENCES `providers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctor_availabilities` ADD CONSTRAINT `doctor_availabilities_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `verification_documents` ADD CONSTRAINT `verification_documents_provider_id_fkey` FOREIGN KEY (`provider_id`) REFERENCES `providers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `verification_documents` ADD CONSTRAINT `verification_documents_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

