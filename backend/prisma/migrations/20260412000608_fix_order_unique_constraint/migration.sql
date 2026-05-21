/*
  Warnings:

  - A unique constraint covering the columns `[source,sourceOrderId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Order_source_sourceOrderId_key" ON "Order"("source", "sourceOrderId");
