/*
  Warnings:

  - A unique constraint covering the columns `[campaignId,userId]` on the table `CampaignParticipation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `CampaignParticipation_campaignId_userId_key` ON `CampaignParticipation`(`campaignId`, `userId`);
