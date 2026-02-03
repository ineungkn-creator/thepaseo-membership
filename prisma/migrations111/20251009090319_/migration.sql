/*
  Warnings:

  - You are about to alter the column `fileType` on the `Receipt` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(4))` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `Receipt` MODIFY `fileType` VARCHAR(191) NOT NULL;
