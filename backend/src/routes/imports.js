import { Router } from "express";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import prisma from "../lib/prisma.js";
import { Prisma } from "@prisma/client";
import { calculateOrderSummaryFromItems } from "../utils/calculateOrderSummaryFromItems.js";

const router = Router();
const upload = multer({ dest: "uploads/" });

const cleanupFile = (filePath) => {
  if (!filePath) return;

  try {
    fs.unlinkSync(filePath);
  } catch (err) {
    console.log("Error deleting temporary file:", err);
  }
};

router.get("/", async (req, res) => {
  try {
    const imports = await prisma.importFile.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(imports);
  } catch (err) {
    console.log("Error fetching imports:", err);

    return res.status(500).json({
      message: "Server error",
    });
  }
});

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "CSV file is required",
      });
    }

    const rows = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => {
        rows.push(row);
      })
      .on("end", async () => {
        try {
          if (!rows.length) {
            cleanupFile(req.file?.path);
            return res.status(400).json({
              message: "CSV file is empty",
            });
          }

          const requiredColumns = [
            "source",
            "sourceOrderId",
            "soldAt",
            "customerName",
            "productName",
            "sku",
            "quantity",
            "itemStatus",
            "unitPrice",
          ];

          const csvColumns = Object.keys(rows[0]);

          const missingColumns = requiredColumns.filter(
            (column) => !csvColumns.includes(column)
          );
          
          if (missingColumns.length > 0) {
            cleanupFile(req.file?.path);
            return res.status(400).json({
              message: "Missing required columns",
              missingColumns,
            });
          }

          const requiredFields = [
            "source",
            "sourceOrderId",
            "soldAt",
            "productName",
            "sku",
            "quantity",
            "itemStatus",
            "unitPrice",
          ];

          const validItemStatus = ["PAID", "REFUNDED", "CANCELLED", "PENDING"];

          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            const missingFields = requiredFields.filter((field) => !row[field]);

            if (missingFields.length > 0) {
              cleanupFile(req.file?.path);
              return res.status(400).json({
                message: "Row validation failed",
                row: i + 2,
                missingFields,
              });
            }

            if (row.source !== "ONLINE") {
              cleanupFile(req.file?.path);
              return res.status(400).json({
                message: "Only ONLINE orders can be imported from CSV",
                row: i + 2,
                value: row.source,
              });
            }

            if (!validItemStatus.includes(row.itemStatus)) {
              cleanupFile(req.file?.path);
              return res.status(400).json({
                message: "Invalid itemStatus value",
                row: i + 2,
                value: row.itemStatus,
              });
            }

            const quantity = Number(row.quantity);
            const soldAt = new Date(row.soldAt);
            const unitPrice = Number(row.unitPrice);

            if (!Number.isInteger(quantity) || quantity <= 0) {
              cleanupFile(req.file?.path);
              return res.status(400).json({
                message: "Invalid quantity value",
                row: i + 2,
                value: row.quantity,
              });
            }

            if (Number.isNaN(unitPrice) || unitPrice <= 0) {
              cleanupFile(req.file?.path);
              return res.status(400).json({
                message: "Invalid unitPrice value",
                row: i + 2,
                value: row.unitPrice,
              });
            }

            if (Number.isNaN(soldAt.getTime())) {
              cleanupFile(req.file?.path);
              return res.status(400).json({
                message: "Invalid soldAt value",
                row: i + 2,
                value: row.soldAt,
              });
            }
          }

          const uniqueOrderKeys = new Set();

          for (const row of rows) {
            const orderKey = `${row.source}_${row.sourceOrderId}`;
            uniqueOrderKeys.add(orderKey);
          }

          const uniqueOrders = Array.from(uniqueOrderKeys).map((key) => {
            const [source, sourceOrderId] = key.split("_");
            return { source, sourceOrderId };
          });

          for (const order of uniqueOrders) {
            const existingOrder = await prisma.order.findFirst({
              where: {
                source: order.source,
                sourceOrderId: order.sourceOrderId,
              },
            });

            if (existingOrder) {
              cleanupFile(req.file?.path);
              return res.status(400).json({
                message: "Duplicate order found in Database",
                order,
              });
            }
          }

          const groupedOrders = {};

          for (const row of rows) {
            const orderKey = `${row.source}_${row.sourceOrderId}`;
            const quantity = Number(row.quantity);
            const unitPrice = Number(row.unitPrice);
            const lineTotal = quantity * unitPrice;

            let refundedQuantity = 0;
            let refundedLineTotal = new Prisma.Decimal(0);
            let cancelledQuantity = 0;
            let cancelledLineTotal = new Prisma.Decimal(0);

            if (row.itemStatus === "REFUNDED") {
              refundedQuantity = quantity;
              refundedLineTotal = new Prisma.Decimal(lineTotal);
            }

            if (row.itemStatus === "CANCELLED") {
              cancelledQuantity = quantity;
              cancelledLineTotal = new Prisma.Decimal(lineTotal);
            }

            if (!groupedOrders[orderKey]) {
              groupedOrders[orderKey] = {
                source: row.source,
                sourceOrderId: row.sourceOrderId,
                customerName: row.customerName || null,
                soldAt: new Date(row.soldAt),
                total: new Prisma.Decimal(0),
                items: [],
              };
            }

            groupedOrders[orderKey].items.push({
              productName: row.productName,
              sku: row.sku,
              quantity,
              itemStatus: row.itemStatus,
              unitPrice: new Prisma.Decimal(unitPrice),
              lineTotal: new Prisma.Decimal(lineTotal),
              refundedQuantity,
              refundedLineTotal,
              cancelledQuantity,
              cancelledLineTotal
            });

            groupedOrders[orderKey].total =
              groupedOrders[orderKey].total.add(new Prisma.Decimal(lineTotal));
          }

          const ordersToImport = Object.values(groupedOrders);

          await prisma.$transaction(async (tx) => {
            for (const order of ordersToImport) {
              const summary = calculateOrderSummaryFromItems(order.items);
          
              const createdOrder = await tx.order.create({
                data: {
                  source: order.source,
                  sourceOrderId: order.sourceOrderId,
                  customerName: order.customerName,
                  soldAt: order.soldAt,
                  status: summary.status,
                  total: order.total,
                  refundedTotal: summary.refundedTotal,
                  cancelledTotal: summary.cancelledTotal
                },
              });
          
              for (const item of order.items) {
                await tx.orderItem.create({
                  data: {
                    productName: item.productName,
                    sku: item.sku,
                    quantity: item.quantity,
                    itemStatus: item.itemStatus,
                    unitPrice: item.unitPrice,
                    lineTotal: item.lineTotal,
                    refundedQuantity: item.refundedQuantity,
                    refundedLineTotal: item.refundedLineTotal,
                    cancelledQuantity: item.cancelledQuantity,
                    cancelledLineTotal: item.cancelledLineTotal,
                    orderId: createdOrder.id,
                  },
                });
              }
            }
          
            await tx.importFile.create({
              data: {
                fileName: req.file.originalname,
                source: "ONLINE",
                status: "SUCCESS",
                importedRows: rows.length,
                failedRows: 0,
              },
            });
          });

          cleanupFile(req.file?.path);

          return res.status(201).json({
            message: "CSV imported successfully",
            totalRows: rows.length,
            totalOrders: ordersToImport.length,
          });
        } catch (err) {
          console.log("Error processing CSV:", err);
          cleanupFile(req.file?.path);
          
          return res.status(500).json({
            message: "Server error while processing CSV",
            error: process.env.NODE_ENV === "development" ? err.message : undefined,
          stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
          });
        }
      })
      .on("error", (err) => {
        console.log("Error parsing CSV:", err);
        cleanupFile(req.file?.path);
        return res.status(500).json({
          message: "Error parsing CSV",
        });
      });
  } catch (err) {
    console.log("Error receiving file:", err);
    cleanupFile(req.file?.path);
    return res.status(500).json({
      message: "Server error",
    });
  }
});

export default router;