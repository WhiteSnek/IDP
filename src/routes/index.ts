import { Router } from "express";
import Controller from "../controllers";
import middleware from "../middlewares";
import loginLimiter from "../utils/rateLimiter";

const router = Router();
const controller = new Controller();

// Public routes
router.post("/register", (req, res) => controller.registerUser(req, res));
router.post("/login", (req, res) => controller.loginUser(req, res));

// Protected routes
router.post("/logout", middleware, loginLimiter, (req, res) => controller.logoutUser(req, res));
router.get("/profile", middleware, (req, res) => controller.getUserProfile(req, res));

export default router;
