-- AlterTable
ALTER TABLE `Coupon` ADD COLUMN `isRedemption` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Reward` ADD COLUMN `isRedemption` BOOLEAN NOT NULL DEFAULT false;
