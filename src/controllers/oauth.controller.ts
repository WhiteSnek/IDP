import { Request, Response } from "express";
import OAuthService from "../service/oauth.service";
import crypto from "crypto";
import { TokenData } from "../types/authcode";
import { generateOAuthToken } from "../utils/generateToken";
import { pemToJwk } from "../utils/pemToJwk";
import AuthService from "../service/auth.service";
import { ApiResponse } from "../utils/ApiResponse";
import jwt from "jsonwebtoken";
import UserApplicationService from "../service/user.application.service";
import { Permissions } from "../types/permissions";

class OAuthController {
  private service: OAuthService;
  private authService: AuthService;
  private userAppService: UserApplicationService;
  constructor() {
    this.service = new OAuthService();
    this.authService = new AuthService();
    this.userAppService = new UserApplicationService();
  }
  async authorize(req: Request, res: Response) {
    try {
      const params = req.query;
      const token = req.cookies.accessToken;
      if (!token) {
        this.redirectToLogin(req, res);
      }
      const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
        id: string;
      };
      req.userId = payload.id;
      if (params.response_type !== "code") {
        return res.status(400).json({ error: "Unsupported response_type" });
      }
      const client = await this.service.validateClient(
        params.client_id as string,
        params.redirect_uri as string,
      );
      if (!client.clientId) {
        return res
          .status(400)
          .json({ error: "Invalid client_id or redirect_uri" });
      }
      const code = crypto.randomBytes(20).toString("hex");
      await this.userAppService.registerApplication(payload.id, client.id);
      await this.service.generateAuthCode(
        code,
        client.clientId as string,
        params.redirect_uri as string,
        req.userId as string,
        params.state as string,
      );
      res.redirect(
        `${params.redirect_uri}?grant_type=${params.grant_type}&code=${code}&state=${params.state}`,
      );
    } catch (err) {
      console.log(err);
      if (err instanceof jwt.TokenExpiredError) {
        console.log("Access token expired");
        return this.redirectToLogin(req, res);
      }

      if (err instanceof jwt.JsonWebTokenError) {
        console.log("Invalid access token");
        return this.redirectToLogin(req, res);
      }

      return res.status(500).json({ message: "Authentication failed" });
    }
  }

  async getToken(req: Request, res: Response) {
    const { grant_type } = req.body;
    console.log(grant_type);
    switch (grant_type) {
      case "authorization_code":
        return this.handleAuthCode(req, res);
      case "client_credentials":
        return this.handleClientCredentials(req, res);
      default:
        return res.status(400).json({
          error: "unsupported_grant_type",
        });
    }
  }

  async handleAuthCode(req: Request, res: Response) {
    try {
      const data: TokenData = req.body;
      const client = await this.service.validateAuthCode(
        data.code,
        data.client_id,
        data.redirect_uri,
      );
      console.log(client);
      if (!client) {
        return res.status(400).json({
          error: "Invalid authorization code, client_id or redirect_uri",
        });
      }
      const { valid, app } = await this.service.validateClientBySecret(
        data.client_id,
        data.client_secret,
      );
      console.log(valid, app);
      if (!valid) {
        return res.status(400).json({ error: "Invalid client credentials" });
      }
      const accessToken = generateOAuthToken(
        { sub: client.userId, scope: client.scope },
        { audience: [data.client_id], expiresIn: 3600 },
      );
      const refreshToken = generateOAuthToken(
        { sub: client.userId, type: "refresh" },
        { audience: [data.client_id], expiresIn: 604800 },
      );
      const response = {
        access_token: accessToken,
        token_type: "Bearer",
        expires_in: 3600,
        refresh_token: refreshToken,
      };
      return res.status(200).json(response);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error });
    }
  }

  async handleClientCredentials(req: Request, res: Response) {
    try {
      const data: TokenData = req.body;
      const { valid, app } = await this.service.validateClientBySecret(
        data.client_id,
        data.client_secret,
      );
      if (!valid || !app) {
        return res.status(401).json({
          error: "invalid_client",
        });
      }
      const permissions: Permissions = {
        notification: app.canSendNotifications,
        channels: app.allowedChannels,
      };
      const token = generateOAuthToken(
        {
          sub: data.client_id,
          permissions,
          type: "client_credentials",
        },
        {
          audience: [data.client_id, "notification_service"],
          expiresIn: 3600,
        },
      );
      return res.status(200).json({
        client_token: token,
        token_type: "Bearer",
        expires_in: 3600,
        scope: permissions,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "server_error",
      });
    }
  }

  async getJwks(req: Request, res: Response) {
    if (!process.env.IDP_PUBLIC_KEY) {
      return res.status(500).json({ error: "Public key not configured" });
    }

    const publicKey = Buffer.from(
      process.env.IDP_PUBLIC_KEY,
      "base64",
    ).toString("utf-8");

    const jwk = pemToJwk(publicKey);

    res.json({
      keys: [
        {
          ...jwk,
          kid: "idp-key-1",
          use: "sig",
          alg: "RS256",
        },
      ],
    });
  }

  async getUserInfo(req: Request, res: Response) {
    try {
      const response = await this.authService.getUserProfile(req.userId!);
      return res.status(response.statusCode).json(response);
    } catch (error) {
      return res
        .status(500)
        .json(new ApiResponse(500, error, "Internal server error!"));
    }
  }

  // async getAppPermissions(req: Request, res: Response){
  //   try {
  //     const response = await this.authService.getAppPermissions();
  //     return res.status(response.statusCode).json(response);
  //   } catch (error) {
  //     return res
  //       .status(500)
  //       .json(new ApiResponse(500, error, "Internal server error!"));
  //   }
  // }

  async redirectToLogin(req: Request, res: Response) {
    const continueUrl = encodeURIComponent(req.originalUrl);
    return res.redirect(
      `${process.env.FRONTEND_URL}/login?redirect=${continueUrl}`,
    );
  }
}

export default OAuthController;
