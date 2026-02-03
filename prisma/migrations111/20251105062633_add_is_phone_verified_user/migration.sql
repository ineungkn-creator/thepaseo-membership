-- AlterTable
ALTER TABLE `User` ADD COLUMN `isPhoneVerified` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `UserCoupon_used_usedAt_idx` ON `UserCoupon`(`used`, `usedAt`);

-- RenameIndex
ALTER TABLE `UserCoupon` RENAME INDEX `UserCoupon_couponId_fkey` TO `UserCoupon_couponId_idx`;

-- RenameIndex
ALTER TABLE `UserCoupon` RENAME INDEX `UserCoupon_userId_fkey` TO `UserCoupon_userId_idx`;
