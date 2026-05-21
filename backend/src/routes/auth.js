//login
import bcrypt from "bcrypt";
import  prisma  from "../lib/prisma.js";
import { Router } from "express";

const router = Router();

router.post("/", async (req,res) => {
    try {
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials"
            })
        }

        const passwordValid = await bcrypt.compare(password, user.passwordHash);
        if (!passwordValid) {
            return res.status(401).json({
                message: "Invalid credentials"
            })
        }
        
            return res.status(200).json({
                message: "Login successful",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            });


    } catch (err) {
        return res.status(500).json({
            message : "Server error"
        });
    }
});

export default router;