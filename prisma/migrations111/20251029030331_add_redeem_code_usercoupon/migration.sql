/*
  Warnings:

  - A unique constraint covering the columns `[redeemCode]` on the table `UserCoupon` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `UserCoupon` ADD COLUMN `redeemCode` VARCHAR(191) NULL,
    ADD COLUMN `verifiedAt` DATETIME(3) NULL,
    ADD COLUMN `verifiedBy` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `UserCoupon_redeemCode_key` ON `UserCoupon`(`redeemCode`);
