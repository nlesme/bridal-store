//users
import  prisma  from "../lib/prisma.js";
import { Router } from "express";
import bcrypt from "bcrypt";

const router = Router();

router.get("/", async(req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (err) {
    res.status(500).send("Error server");
}
});

router.post("/",async(req, res) => {
    try {

        const {name, email, password} = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        } 
            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    passwordHash: hashedPassword
                }
            });
            return res.status(201).json({
                id: user.id,
                name: user.name,
                email:user.email
            });
    } catch (err) {
        if (err.code === "P2002") {
            return res.status(409).json({
                message: "Email already exists"
            })
        }
        console.log('Error creating user:', err);
        return res.status(500).json({
            message: "Server error"
        });
    }
});

export default router;