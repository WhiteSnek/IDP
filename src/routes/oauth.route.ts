import { Router } from "express"
import OAuthController from "../controllers/oauth.controller";
import middleware from "../middlewares";

const router = Router();
const oauthController = new OAuthController();

router.get("/authorize", middleware, (req, res) => oauthController.authorize(req, res));
export default router;