import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import middleware from "../middlewares/auth.middleware";
import loginLimiter from "../utils/rateLimiter";

const router = Router();
const authController = new AuthController();

// Public routes
router.post("/register", (req, res) => authController.registerUser(req, res));
router.post("/login", (req, res) => authController.loginUser(req, res));

// Protected routes
router.post("/logout", middleware, loginLimiter, (req, res) => authController.logoutUser(req, res));
router.get("/profile", middleware, (req, res) => authController.getUserProfile(req, res));
router.post("/refresh", (req,res) => authController.refresh(req,res))

export default router;
