-- AlterTable
ALTER TABLE `doctors` ADD COLUMN `rating` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `total_ratings` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `conditions` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `conditions_name_key`(`name`),
    UNIQUE INDEX `conditions_slug_key`(`slug`),
    INDEX `conditions_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `doctor_conditions` (
    `doctor_id` VARCHAR(191) NOT NULL,
    `condition_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `doctor_conditions_doctor_id_idx`(`doctor_id`),
    INDEX `doctor_conditions_condition_id_idx`(`condition_id`),
    PRIMARY KEY (`doctor_id`, `condition_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tests` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `short_description` VARCHAR(191) NULL,
    `preparation` TEXT NULL,
    `sample_type` VARCHAR(191) NULL,
    `tat` VARCHAR(191) NULL,
    `price` DOUBLE NULL DEFAULT 0,
    `discount_price` DOUBLE NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_featured` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tests_slug_key`(`slug`),
    UNIQUE INDEX `tests_code_key`(`code`),
    INDEX `tests_is_active_idx`(`is_active`),
    INDEX `tests_is_featured_idx`(`is_featured`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `test_conditions` (
    `test_id` VARCHAR(191) NOT NULL,
    `condition_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `test_conditions_test_id_idx`(`test_id`),
    INDEX `test_conditions_condition_id_idx`(`condition_id`),
    PRIMARY KEY (`test_id`, `condition_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `provider_tests` (
    `id` VARCHAR(191) NOT NULL,
    `provider_id` VARCHAR(191) NOT NULL,
    `test_id` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `discount_price` DOUBLE NULL,
    `home_collection_available` BOOLEAN NOT NULL DEFAULT true,
    `lab_visit_available` BOOLEAN NOT NULL DEFAULT true,
    `turnaround_time` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `provider_tests_provider_id_idx`(`provider_id`),
    INDEX `provider_tests_test_id_idx`(`test_id`),
    INDEX `provider_tests_price_idx`(`price`),
    INDEX `provider_tests_is_active_idx`(`is_active`),
    UNIQUE INDEX `provider_tests_provider_id_test_id_key`(`provider_id`, `test_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `doctors_rating_idx` ON `doctors`(`rating`);

-- AddForeignKey
ALTER TABLE `doctor_conditions` ADD CONSTRAINT `doctor_conditions_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctor_conditions` ADD CONSTRAINT `doctor_conditions_condition_id_fkey` FOREIGN KEY (`condition_id`) REFERENCES `conditions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_conditions` ADD CONSTRAINT `test_conditions_test_id_fkey` FOREIGN KEY (`test_id`) REFERENCES `tests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_conditions` ADD CONSTRAINT `test_conditions_condition_id_fkey` FOREIGN KEY (`condition_id`) REFERENCES `conditions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `provider_tests` ADD CONSTRAINT `provider_tests_provider_id_fkey` FOREIGN KEY (`provider_id`) REFERENCES `providers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `provider_tests` ADD CONSTRAINT `provider_tests_test_id_fkey` FOREIGN KEY (`test_id`) REFERENCES `tests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
