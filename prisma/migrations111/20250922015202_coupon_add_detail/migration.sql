-- AlterTable
ALTER TABLE `Coupon` ADD COLUMN `maxPerUser` INTEGER NULL,
    ADD COLUMN `pointEarn` INTEGER NULL,
    ADD COLUMN `quantity` INTEGER NULL,
    ADD COLUMN `terms` TEXT NULL,
    MODIFY `description` TEXT NULL,
    MODIFY `pointCost` INTEGER NULL;
