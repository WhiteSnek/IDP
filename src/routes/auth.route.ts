import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import middleware from "../middlewares/auth.middleware";
import loginLimiter from "../utils/rateLimiter";
import SessionController from "../controllers/session.controller";

const router = Router();
const authController = new AuthController();
const sessionController = new SessionController()

// Public routes
router.post("/register", (req, res) => authController.registerUser(req, res));
router.post("/login", (req, res) => authController.loginUser(req, res));

// Protected routes
router.post("/logout", middleware, loginLimiter, (req, res) => authController.logoutUser(req, res));
router.get("/profile", middleware, (req, res) => authController.getUserProfile(req, res));
router.post("/refresh", (req,res) => authController.refresh(req,res))
router.get("/sessions", middleware, (req,res) => sessionController.getUserSessions(req,res))
router.delete("/sessions/:id", middleware, (req,res) => sessionController.deleteSession(req,res))
router.post("/otp/:channel", (req,res) => authController.sendOtp(req,res))
router.post("/verify/otp/:channel", (req,res) => authController.verifyOTP(req,res))

export default router;
