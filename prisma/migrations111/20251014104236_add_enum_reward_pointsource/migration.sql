-- AlterTable
ALTER TABLE `PointTransaction` MODIFY `referenceType` ENUM('RECEIPT', 'CAMPAIGN', 'COUPON', 'EVENT', 'MISSION', 'REWARD', 'REFERRAL', 'ADJUST') NULL;
