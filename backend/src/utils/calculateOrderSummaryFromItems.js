import { Prisma } from "@prisma/client";


export function calculateOrderSummaryFromItems(items) {
  let refundedTotal = new Prisma.Decimal(0);
  let cancelledTotal = new Prisma.Decimal(0);

  let itemsStatuses = new Set(items.map(item => item.itemStatus));

  for (const item of items) {
    
    refundedTotal = refundedTotal.plus(item.refundedLineTotal ?? new Prisma.Decimal(0));
    cancelledTotal = cancelledTotal.plus(item.cancelledLineTotal ?? new Prisma.Decimal(0));
  }
    let status;

    if (itemsStatuses.size === 1) {
      const [only] = itemsStatuses;
      status = only;
    } else {
      if (itemsStatuses.has("REFUNDED")) {
        status = "PARTIALLY_REFUNDED";
      } else if (itemsStatuses.has("CANCELLED")) {
        status = "PARTIALLY_CANCELLED";
      } else if (itemsStatuses.has("PENDING")) {
        status = "PARTIALLY_PENDING";
      } else {
        status = "PAID";
      }
    }

    return {refundedTotal, cancelledTotal, status};
  }
