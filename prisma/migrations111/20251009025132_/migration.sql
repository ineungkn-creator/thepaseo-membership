-- AlterTable
ALTER TABLE `Campaign` MODIFY `code` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Coupon_startDate_endDate_idx` ON `Coupon`(`startDate`, `endDate`);
