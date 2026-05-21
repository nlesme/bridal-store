//orders
import  prisma  from "../lib/prisma.js";
import { Prisma } from "@prisma/client";
import { Router } from "express";


const router = Router();
const VALID_PERIODS = ["month", "quarter", "semester", "annual"];
const VALID_SEARCH_BY = ["customer", "orderNumber"];

function getPagination(page, limit) {
    let currentPage = Number(page);
    let currentLimit = Number(limit);
  
    if (!Number.isInteger(currentPage) || currentPage < 1) {
      currentPage = 1;
    }
  
    if (!Number.isInteger(currentLimit) || currentLimit < 1 || currentLimit > 50) {
      currentLimit = 10;
    }
  
    const skip = (currentPage - 1) * currentLimit;
  
    return { currentPage, currentLimit, skip };
  }

  function getDateRangeFromPeriod(period) {
    if (!period) return null;
  
    const now = new Date();
    let startDate = null;
    let endDate = null;
  
    if (period === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  
    } else if (period === "quarter") {
      const currentMonth = now.getMonth();
      const startQuarterMonth = Math.floor(currentMonth / 3) * 3;
  
      startDate = new Date(now.getFullYear(), startQuarterMonth, 1);
      endDate = new Date(now.getFullYear(), startQuarterMonth + 3, 1);
  
    } else if (period === "semester") {
      const currentMonth = now.getMonth();
      const startSemesterMonth = Math.floor(currentMonth / 6) * 6;
  
      startDate = new Date(now.getFullYear(), startSemesterMonth, 1);
      endDate = new Date(now.getFullYear(), startSemesterMonth + 6, 1);
  
    } else if (period === "annual") {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear() + 1, 0, 1);
    }
  
    return { startDate, endDate };
  }

  function buildBaseOrderFilter({ source, status, search, searchBy, period }, options = {}) {
    const { includeStatus = false } = options;
    const filter = {};
    const searchNormalized = search?.trim();
  
    if (period && !VALID_PERIODS.includes(period)) {
      return { error: "Invalid value for period" };
    }
  
    const dateRange = getDateRangeFromPeriod(period);
    if (dateRange) {
      filter.soldAt = {
        gte: dateRange.startDate,
        lt: dateRange.endDate
      };
    }
  
    if (source) {
      filter.source = source;
    }
  
    if (includeStatus && status) {
      filter.status = status;
    }
  
    if ((!searchNormalized && searchBy) || (!searchBy && searchNormalized)) {
      return { error: "search and searchBy are required!" };
    }
  
    if (searchNormalized && !VALID_SEARCH_BY.includes(searchBy)) {
      return { error: "Invalid value searchBy" };
    }
  
    if (searchNormalized) {
      if (searchBy === "customer") {
        filter.customerName = {
          contains: searchNormalized,
          mode: "insensitive"
        };
      } else if (searchBy === "orderNumber") {
        filter.sourceOrderId = {
          contains: searchNormalized,
          mode: "insensitive"
        };
      }
    }
  
    return { filter };
  }

router.post("/", async (req,res) => {
    try {
        const {source, sourceOrderId, customerName, soldAt, status, total} = req.body;
        
        if (!source || !sourceOrderId || !customerName || !soldAt || !status || total === undefined ) {
            return res.status(400).json({
                message: "source, sourceOrderId, customerName, soldAt, status and total are required"
            });
        }

        const parsedSoldAt =  new Date(soldAt);

        if (typeof total !== "number" || total <= 0) {
            return res.status(400).json({
                message: "Invalid value for total"
            });
        }

        if (source !== "ONLINE" && source !== "PARTY") {
            return res.status(400).json({
                message: "Invalid option for source"
            });
        }

        if (status !== "PAID" && status !== "PENDING" && status !== "REFUNDED" && status !== "PARTIALLY_REFUNDED" && status !== "CANCELLED") {
            return res.status(400).json({
                message: "Invalid option for status"
            })
        }

        if (Number.isNaN(parsedSoldAt.getTime())) {
            return res.status(400).json({
                message: "Invalid date for soldAt"
            });
        }

        const order = await prisma.order.create({
            data: {
                source,
                sourceOrderId,
                customerName,
                soldAt: parsedSoldAt,
                status,
                total
            }
        });

        return res.status(201).json({
            id: order.id,
            source : order.source,
            sourceOrderId: order.sourceOrderId,
            customerName: order.customerName,
            soldAt: order.soldAt,
            status: order.status,
            total: order.total
        });

    } catch(err){
        console.log("Error fetching orders", err);
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002"){
            return res.status(409).json({
                message: "Order already exists for this source and sourceOrderId"
            });
        }
        
        return res.status(500).json({
            message: "Error server"
        });
    }
});


router.get("/", async (req, res) => {
    try {
      const { currentPage, currentLimit, skip } = getPagination(req.query.page, req.query.limit);
  
      const { filter, error } = buildBaseOrderFilter(req.query, { includeStatus: true });
      if (error) {
        return res.status(400).json({ message: error });
      }
  
      const orders = await prisma.order.findMany({
        where: filter,
        orderBy: { soldAt: "desc" },
        skip,
        take: currentLimit
      });
  
      const total = await prisma.order.count({ where: filter });
      const totalPages = Math.ceil(total / currentLimit);
  
      return res.json({
        data: orders,
        page: currentPage,
        limit: currentLimit,
        total,
        totalPages
      });
    } catch (err) {
      console.log("Error:", err);
      return res.status(500).json({ message: "Error server" });
    }
  });

  router.get("/kpis", async (req, res) => {
    try {
      const { filter, error } = buildBaseOrderFilter(req.query, { includeStatus: false });
      if (error) {
        return res.status(400).json({ message: error });
      }
  
      const totalOrders = await prisma.order.count({
        where: {
          ...filter,
          status: {
            in: ["PAID", "PARTIALLY_REFUNDED", "PARTIALLY_PENDING","REFUNDED", "CANCELLED", "PARTIALLY_CANCELLED"]
          }
        }
      });
  
      const pendingOrders = await prisma.order.count({
        where: {
          ...filter,
          status: {
            in: ["PENDING", "PARTIALLY_PENDING"]
        }
      }
      });
  
      const cancelledOrders = await prisma.order.count({
        where: {
          ...filter,
          status: {
            in: ["CANCELLED", "PARTIALLY_CANCELLED"]
          }
        }
      });
  
      const grossSalesResult = await prisma.order.aggregate({
        where: {
          ...filter,
          status: {
            in: ["PAID", "PARTIALLY_REFUNDED", "REFUNDED", "CANCELLED", "PARTIALLY_CANCELLED"]
          }
        },
        _sum: {
          total: true
        }
      });
  
      const cancelledSalesResult = await prisma.order.aggregate({
        where: {
          ...filter,
          status: {
            in: ["CANCELLED", "PARTIALLY_CANCELLED"]
          }
        },
        _sum: {
          cancelledTotal: true
        }
      });

      const refundedSalesResult = await prisma.order.aggregate({
        where: {
          ...filter,
          status: {
            in: ["PARTIALLY_REFUNDED", "REFUNDED"]
          }
        },
        _sum: {
          refundedTotal: true
        }
      });
  
      const grossSales = grossSalesResult._sum.total ?? new Prisma.Decimal(0);
      const refundedSales = refundedSalesResult._sum.refundedTotal ?? new Prisma.Decimal(0);
      const cancelledSales = cancelledSalesResult._sum.cancelledTotal ?? new Prisma.Decimal(0);
      const netSales = grossSales.minus(refundedSales).minus(cancelledSales);
  
      const grossUnitsResult = await prisma.orderItem.aggregate({
        where: {
          order: {
            ...filter
          },
            itemStatus: {
              in: ["PAID", "REFUNDED", "CANCELLED"]
            }
        },
        _sum: {
          quantity: true
        }
      });
  
      const refundedUnitsResult = await prisma.orderItem.aggregate({
        where: {
          order: {
            ...filter
          }
        },
        _sum: {
            refundedQuantity: true
        }
      });

      const cancelledQuantity = await prisma.orderItem.aggregate({
        where: {
          order: {
            ...filter
          }
        },
        _sum: {
          cancelledQuantity: true
        }
      });
  
      const grossUnitsSold = grossUnitsResult._sum.quantity ?? 0;
      const refundedUnits = refundedUnitsResult._sum.refundedQuantity ?? 0;
      const cancelledUnits = cancelledQuantity._sum.cancelledQuantity ?? 0;
      const netUnitsSold = grossUnitsSold - refundedUnits - cancelledUnits;
  
      return res.json({
        orders: {
          totalOrders,
          pendingOrders,
          cancelledOrders
        },
        sales: {
          grossSales,
          refundedSales,
          netSales
        },
        products: {
          grossUnitsSold,
          refundedUnits,
          netUnitsSold
        }
      });
    } catch (err) {
      console.log("Error:", err);
      return res.status(500).json({ message: "Error server" });
    }
  });

router.patch("/:id/refund", async(req,res) => {
    try {
        const {id} = req.params;
        const {refundAmount, refundedAt} = req.body;
        
        const orderId = Number(id);
        if (!Number.isInteger(orderId) || orderId < 1) {
            return res.status(400).json({ message: "Invalid ID"})
        }

        const order = await prisma.order.findUnique({
            where: {
                id: orderId
            },
            select: {
                id: true,
                total: true,
                refundedTotal: true,
                status: true
            }
        });
       
        if (!order) {
            return res.status(404).json({message: "Order not found"})
        }


        if(refundAmount === undefined) {
            return res.status(400).json({message: "Refund amount is required"})
        }

        const refundAmountDecimal = new Prisma.Decimal(refundAmount);
        const currentRefundedTotal = order.refundedTotal;
        const newRefundedTotal = currentRefundedTotal.plus(refundAmountDecimal);

        const parsedRefundedAt =  new Date(refundedAt);

        let newStatus = "";
        let zeroDecimal = new Prisma.Decimal(0);


        if (refundAmountDecimal.lessThanOrEqualTo(zeroDecimal)){
            return res.status(400).json({message: "refoundAmount must be greater than 0"})
        } else if (newRefundedTotal.greaterThan(order.total)) {
            return res.status(400).json({message: "Refund cannot exceed to order total"})
        }

        if (newRefundedTotal.equals(order.total)) {
            newStatus = "REFUNDED";
        } else if (newRefundedTotal.greaterThan(zeroDecimal) && newRefundedTotal.lessThan(order.total)) {
            newStatus = "PARTIALLY_REFUNDED";
        }

        if (Number.isNaN(parsedRefundedAt.getTime())) {
            return res.status(400).json({
                message: "Invalid date for refundedAt"
            });
        }

        const updateOrder = await prisma.order.update({
            where: {
                id: order.id
            },
            data: {
                refundedTotal: newRefundedTotal,
                refundedAt: parsedRefundedAt,
                status: newStatus
            }
        })

        return res.json({
            message: "Refund apply successfully",
            data: {
                id: updateOrder.id,
                source: updateOrder.source,
                sourceOrderId: updateOrder.sourceOrderId,
                status: updateOrder.status,
                total: updateOrder.total,
                refundedTotal: updateOrder.refundedTotal,
                refundedAt: updateOrder.refundedAt
            }
        })
        
    } catch(err) {
        console.log("Error:", err);
        return res.status(500).json({
            message: "Error server"
        });
    }
});

router.get("/:id", async(req,res) => {
    try {
        const {id} = req.params;
        const numberId = Number(id);

        if (!Number.isInteger(numberId) || numberId < 1) {
            return res.status(400).json ({
                message: "ID invalid"
            });
        }

        const order = await prisma.order.findUnique( {
            where: {
                id : numberId
            },
            include: {
                items: true
            }
        });

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        return res.json({
            data: {
                id: order.id,
                source: order.source,
                sourceOrderId: order.sourceOrderId,
                customerName: order.customerName,
                soldAt: order.soldAt,
                status: order.status,
                total: order.total,
                refundedTotal: order.refundedTotal,
                refundedAt: order.refundedAt,
                items: order.items
            }
        });

    } catch(err){
        console.log("Error:", err);
        return res.status(500).json({
            message: "Error server"
        });
    }
})



export default router;