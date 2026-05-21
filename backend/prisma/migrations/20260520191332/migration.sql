-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "cancelledLineTotal" DECIMAL(65,30) NOT NULL DEFAULT 0;
