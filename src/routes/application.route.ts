import { Router } from "express"
import ApplicationController from "../controllers/application.controller"
import { requireAdmin } from "../middlewares/admin.middleware";
import middleware from "../middlewares/auth.middleware";

const router = Router();
const applicationController = new ApplicationController();

router.post("/register", (req, res) => applicationController.registerApplication(req, res));
router.get("/", middleware , requireAdmin , (req, res) => applicationController.getAllApplications(req, res));
export default router;