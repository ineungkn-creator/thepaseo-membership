/*
  Warnings:

  - You are about to drop the column `type` on the `Help` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Help` DROP COLUMN `type`,
    ADD COLUMN `order` INTEGER NOT NULL DEFAULT 0;
