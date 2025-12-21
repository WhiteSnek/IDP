import { Router } from "express"
import { requireAdmin } from "../middlewares/admin.middleware";
import middleware from "../middlewares/auth.middleware";
import UserApplicationController from "../controllers/user.application.controller";

const router = Router();
const applicationController = new UserApplicationController();

router.get("/", middleware, requireAdmin, (req,res)=>applicationController.getAllEntries(req,res))
export default router;