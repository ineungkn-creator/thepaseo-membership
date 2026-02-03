-- AddForeignKey
ALTER TABLE `Coupon` ADD CONSTRAINT `Coupon_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
