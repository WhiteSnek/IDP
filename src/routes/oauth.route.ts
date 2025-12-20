import { Router } from "express"
import OAuthController from "../controllers/oauth.controller";
import { oauthAuthMiddleware } from "../middlewares/oauth.middleware";

const router = Router();
const oauthController = new OAuthController();

router.get("/authorize", (req, res) => oauthController.authorize(req, res));
router.post("/token", (req, res) => oauthController.getToken(req, res));
router.get("/.well-known/jwks.json", (req, res) => oauthController.getJwks(req, res));
router.get("/userinfo", oauthAuthMiddleware, (req, res) => oauthController.getUserInfo(req, res));
export default router;