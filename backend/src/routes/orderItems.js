//orderItems
import  prisma  from "../lib/prisma.js";
import { Router } from "express";

const router = Router();

router.post("/", async (req, res) => {
    try {
        const { productName, sku, quantity, orderId, unitPrice } = req.body;

        if ( !productName || !sku || !quantity || !orderId || unitPrice === undefined) {
            return res.status(400).json({
                message: "productName, sku, quantity, orderId and unitPrice are required"
            });
        }

        const lineTotal = unitPrice * quantity;

        const orderItem = await prisma.orderItem.create({
            data: {
                productName,
                sku,
                quantity,
                orderId,
                unitPrice,
                lineTotal
            }
        });
        return res.status(201).json({
                id: orderItem.id,
                productName: orderItem.productName,
                sku: orderItem.sku,
                quantity: orderItem.quantity,
                orderId: orderItem.orderId,
                unitPrice: orderItem.unitPrice,
                lineTotal: orderItem.lineTotal
        });

    } catch(err) {
        console.log("Error creating order item:", err);

        return res.status(500).json({
            message: "Server error"
        });
    }
});

export default router;