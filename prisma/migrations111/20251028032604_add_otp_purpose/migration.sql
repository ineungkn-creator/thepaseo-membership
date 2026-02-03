/*
  Warnings:

  - Added the required column `purpose` to the `OtpVerification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `OtpVerification` ADD COLUMN `purpose` ENUM('REGISTER', 'RESET_PASSWORD', 'VERIFY_PHONE') NOT NULL,
    ADD COLUMN `requestCount` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `verifiedAt` DATETIME(3) NULL;
