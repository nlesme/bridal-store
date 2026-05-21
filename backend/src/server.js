import "dotenv/config";
import express from "express";
import usersRouter from "./routes/users.js";
import authRouter from "./routes/auth.js";
import ordersRouter from "./routes/orders.js";
import orderItemsRouter from "./routes/orderItems.js";
import importsRouter from "./routes/imports.js";
import cors from "cors";


const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Backend running");
});

app.get("/health", (req, res) => {
    res.json({
        status : "ok"
    });
});

app.use("/users", usersRouter);
app.use("/auth/login", authRouter);
app.use("/orders", ordersRouter);
app.use("/order-items", orderItemsRouter);
app.use("/imports", importsRouter);



const server = app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});

server.on("error", (err) => {
    console.log("Listen error:", err);
});