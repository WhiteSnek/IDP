import { Router } from "express"
import ApplicationController from "../controllers/application.controller"

const router = Router();
const applicationController = new ApplicationController();

router.post("/register", (req, res) => applicationController.registerApplication(req, res));

export default router;