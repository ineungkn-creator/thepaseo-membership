/*
  Warnings:

  - You are about to alter the column `fileType` on the `Receipt` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(7))`.

*/
-- AlterTable
ALTER TABLE `Receipt` MODIFY `fileType` ENUM('IMAGE', 'PDF') NOT NULL;
