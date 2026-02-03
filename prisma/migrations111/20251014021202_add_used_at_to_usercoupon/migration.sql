-- AlterTable
ALTER TABLE `UserCoupon` ADD COLUMN `usedAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `_CouponBranches` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_CouponBranches_AB_unique`(`A`, `B`),
    INDEX `_CouponBranches_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_CouponShops` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_CouponShops_AB_unique`(`A`, `B`),
    INDEX `_CouponShops_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_CouponBranches` ADD CONSTRAINT `_CouponBranches_A_fkey` FOREIGN KEY (`A`) REFERENCES `Branch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CouponBranches` ADD CONSTRAINT `_CouponBranches_B_fkey` FOREIGN KEY (`B`) REFERENCES `Coupon`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CouponShops` ADD CONSTRAINT `_CouponShops_A_fkey` FOREIGN KEY (`A`) REFERENCES `Coupon`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CouponShops` ADD CONSTRAINT `_CouponShops_B_fkey` FOREIGN KEY (`B`) REFERENCES `Shop`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
