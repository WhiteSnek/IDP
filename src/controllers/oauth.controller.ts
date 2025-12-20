import { Request, Response } from "express";
import OAuthService from "../service/oauth.service";
import crypto from "crypto";
import { TokenData } from "../types/authcode";
import { generateOAuthToken } from "../utils/generateToken";
import { pemToJwk } from "../utils/pemToJwk";
import AuthService from "../service/auth.service";
import { ApiResponse } from "../utils/ApiResponse";
import jwt from "jsonwebtoken";

class OAuthController {
  private service: OAuthService;
  private authService: AuthService;
  constructor() {
    this.service = new OAuthService();
    this.authService = new AuthService();
  }
  async authorize(req: Request, res: Response) {
    const params = req.query;
    const token = req.cookies.accessToken;
    if (!token) {
      const continueUrl = encodeURIComponent(req.originalUrl);
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?redirect=${continueUrl}`
      );
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
      params.redirect_uri as string
    );
    if (!client.clientId) {
      return res
        .status(400)
        .json({ error: "Invalid client_id or redirect_uri" });
    }
    const code = crypto.randomBytes(20).toString("hex");
    await this.service.generateAuthCode(
      code,
      client.clientId as string,
      params.redirect_uri as string,
      req.userId as string,
      params.state as string
    );
    res.redirect(`${params.redirect_uri}?code=${code}&state=${params.state}`);
  }

  async getToken(req: Request, res: Response) {
    const data: TokenData = req.body;
    const client = await this.service.validateAuthCode(
      data.code,
      data.client_id,
      data.redirect_uri
    );
    if (!client) {
      return res.status(400).json({
        error: "Invalid authorization code, client_id or redirect_uri",
      });
    }
    const isClientValid = await this.service.validateClientBySecret(
      data.client_id,
      data.client_secret
    );
    if (!isClientValid) {
      return res.status(400).json({ error: "Invalid client credentials" });
    }
    const accessToken = generateOAuthToken(
      {
        sub: client.userId,
        scope: client.scope,
      },
      {
        audience: data.client_id,
        expiresIn: 3600,
      }
    );
    const refreshToken = generateOAuthToken(
      {
        sub: client.userId,
        type: "refresh",
      },
      {
        audience: data.client_id,
        expiresIn: 604800,
      }
    );

    const response = {
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: 3600,
      refresh_token: refreshToken,
    };
    return res.status(200).json(response);
  }

  async getJwks(req: Request, res: Response) {
    if (!process.env.IDP_PUBLIC_KEY) {
      return res.status(500).json({ error: "Public key not configured" });
    }

    const jwk = pemToJwk(process.env.IDP_PUBLIC_KEY.replace(/\\n/g, "\n"));

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
}

export default OAuthController;
