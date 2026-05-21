/*
  Warnings:

  - You are about to drop the column `statusItem` on the `OrderItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "statusItem",
ADD COLUMN     "itemStatus" "ItemStatus" NOT NULL DEFAULT 'PENDING';
