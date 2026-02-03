/*
  Warnings:

  - A unique constraint covering the columns `[redeemCode]` on the table `RewardParticipation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[rewardId,userId]` on the table `RewardParticipation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `RewardParticipation` ADD COLUMN `redeemCode` VARCHAR(191) NULL,
    ADD COLUMN `verifiedAt` DATETIME(3) NULL,
    ADD COLUMN `verifiedBy` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `BannerUploadTerm` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `linkUrl` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `RewardParticipation_redeemCode_key` ON `RewardParticipation`(`redeemCode`);

-- CreateIndex
CREATE UNIQUE INDEX `RewardParticipation_rewardId_userId_key` ON `RewardParticipation`(`rewardId`, `userId`);
