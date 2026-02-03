-- AddForeignKey
ALTER TABLE `PointTransaction` ADD CONSTRAINT `PointTransaction_receiptId_fkey` FOREIGN KEY (`receiptId`) REFERENCES `Receipt`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
