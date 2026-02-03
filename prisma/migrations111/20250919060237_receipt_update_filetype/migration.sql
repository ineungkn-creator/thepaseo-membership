/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Receipt` table. All the data in the column will be lost.
  - Added the required column `fileType` to the `Receipt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileUrl` to the `Receipt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Receipt` DROP COLUMN `imageUrl`,
    ADD COLUMN `fileType` VARCHAR(191) NOT NULL,
    ADD COLUMN `fileUrl` VARCHAR(191) NOT NULL;
