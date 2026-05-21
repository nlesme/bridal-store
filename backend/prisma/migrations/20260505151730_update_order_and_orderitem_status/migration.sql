-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('PAID', 'REFUNDED', 'CANCELLED', 'PENDING');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'PARTIALLY_CANCELLED';

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "cancelledQuantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "statusItem" "ItemStatus" NOT NULL DEFAULT 'PENDING';
