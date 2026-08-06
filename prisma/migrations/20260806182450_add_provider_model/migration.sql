/*
  Warnings:

  - You are about to drop the column `email_verification_expires` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `email_verification_token` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ProviderType" AS ENUM ('LAB', 'CLINIC', 'BOTH');

-- DropIndex
DROP INDEX "users_email_verification_token_idx";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "email_verification_expires",
DROP COLUMN "email_verification_token";

-- CreateTable
CREATE TABLE "providers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "ProviderType" NOT NULL,
    "description" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT DEFAULT 'India',
    "pincode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "rating" DOUBLE PRECISION DEFAULT 0,
    "total_ratings" INTEGER NOT NULL DEFAULT 0,
    "opening_hours" JSONB,
    "home_collection_available" BOOLEAN NOT NULL DEFAULT false,
    "profile_image" TEXT,
    "cover_image" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "owner_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "providers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "providers_slug_key" ON "providers"("slug");

-- CreateIndex
CREATE INDEX "providers_type_idx" ON "providers"("type");

-- CreateIndex
CREATE INDEX "providers_city_idx" ON "providers"("city");

-- CreateIndex
CREATE INDEX "providers_state_idx" ON "providers"("state");

-- CreateIndex
CREATE INDEX "providers_pincode_idx" ON "providers"("pincode");

-- CreateIndex
CREATE INDEX "providers_is_verified_idx" ON "providers"("is_verified");

-- CreateIndex
CREATE INDEX "providers_is_active_idx" ON "providers"("is_active");

-- CreateIndex
CREATE INDEX "providers_is_featured_idx" ON "providers"("is_featured");

-- CreateIndex
CREATE INDEX "providers_rating_idx" ON "providers"("rating");

-- CreateIndex
CREATE INDEX "providers_owner_id_idx" ON "providers"("owner_id");

-- CreateIndex
CREATE INDEX "providers_latitude_longitude_idx" ON "providers"("latitude", "longitude");

-- AddForeignKey
ALTER TABLE "providers" ADD CONSTRAINT "providers_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
