import { CookieOptions, Request, Response } from "express";
import AuthService from "../service/auth.service";
import SessionService from "../service/session.service";
import {
  loginUserSchema,
  registerUserSchema,
} from "../validation/auth.validation";
import { email, ZodError } from "zod";
import { ApiResponse } from "../utils/ApiResponse";
import { generateToken } from "../utils/generateToken";
import { normalizeIp } from "../utils/normalizeIp";
import { COOKIE_OPTIONS } from "../constants";
import jwt from "jsonwebtoken";
import NotificationService from "../service/notification.service";

class AuthController {
  private service: AuthService;
  private sessionService: SessionService;
  private notificationService: NotificationService;
  constructor() {
    this.service = new AuthService();
    this.sessionService = new SessionService();
    this.notificationService = new NotificationService();
  }

  async registerUser(req: Request, res: Response) {
    try {
      const data = registerUserSchema.parse(req.body);
      const response = await this.service.registerUser(data);
      return res.status(response.statusCode).json(response);
    } catch (error) {
      if (error instanceof ZodError) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              error,
              "All fields are required and must be valid!",
            ),
          );
      }
      return res
        .status(500)
        .json(new ApiResponse(500, {}, "Internal server error!"));
    }
  }

  async loginUser(req: Request, res: Response) {
    try {
      const data = loginUserSchema.parse(req.body);
      const userAgent = req.get("user-agent") ?? "unknown";
      const ipAddress =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.socket.remoteAddress ||
        "unknown";
      const normalizedIp = normalizeIp(ipAddress);
      const { response, accessToken, refreshToken } =
        await this.service.loginUser(
          data.email || "",
          data.phone || "",
          data.password,
        );
      if (response && accessToken && refreshToken) {
        await this.sessionService.registerSession(
          response.data.id,
          refreshToken,
          userAgent,
          normalizedIp,
        );
      }
      const options: CookieOptions = COOKIE_OPTIONS;
      res
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .status(response.statusCode)
        .json(response);
    } catch (error) {
      console.log(error);
      if (error instanceof ZodError) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              error,
              "All fields are required and must be valid!",
            ),
          );
      }
      return res
        .status(500)
        .json(new ApiResponse(500, error, "Internal server error!"));
    }
  }

  async logoutUser(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      await this.sessionService.deleteSession(refreshToken);
      return res
        .cookie("accessToken", "", { httpOnly: true, maxAge: 0 })
        .cookie("refreshToken", "", { httpOnly: true, maxAge: 0 })
        .status(200)
        .json(new ApiResponse(200, {}, "Logout successful"));
    } catch (error) {
      return res
        .status(500)
        .json(new ApiResponse(500, error, "Internal server error!"));
    }
  }

  async getUserProfile(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const response = await this.service.getUserProfile(userId!);
      return res.status(response.statusCode).json(response);
    } catch (error) {
      return res
        .status(500)
        .json(new ApiResponse(500, error, "Internal server error!"));
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res
          .status(401)
          .json(new ApiResponse(401, {}, "Refresh token missing"));
      }
      const session = await this.sessionService.getSessionByToken(refreshToken);
      if (!session) {
        return res
          .status(401)
          .json(new ApiResponse(401, {}, "Invalid refresh token"));
      }
      if (session.expiresAt < new Date()) {
        await this.sessionService.deleteSession(refreshToken);
        return res
          .status(401)
          .json(new ApiResponse(401, {}, "Session expired"));
      }
      const payload = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET!,
      ) as { id: string; isAdmin: boolean };
      await this.sessionService.deleteSession(refreshToken);
      const newAccessToken = generateToken(
        { id: payload.id, isAdmin: payload.isAdmin },
        "access",
      );
      const newRefreshToken = generateToken(
        { id: payload.id, isAdmin: payload.isAdmin },
        "refresh",
      );
      await this.sessionService.registerSession(
        session.userId,
        newRefreshToken,
        session.userAgent || "unknown",
        session.ipAddress || "unknown",
      );
      const options: CookieOptions = COOKIE_OPTIONS;
      res
        .cookie("accessToken", newAccessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .status(200)
        .json(new ApiResponse(200, {}, "Refresh Token updated successfully"));
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json(new ApiResponse(500, error, "Internal Server Error"));
    }
  }

  async sendOtp(req: Request, res: Response) {
    try {
      const { channel } = req.params;
      const { receiver } = req.body;
      if (!receiver) {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, "Receiver is required"));
      }
      if (process.env.NODE_ENV === "production") {
        const response = await this.notificationService.sendOtp(
          receiver,
          channel as "email" | "sms",
        );
        if (!response) {
          return res
            .status(400)
            .json(new ApiResponse(400, {}, `Failed to send otp to ${channel}`));
        }
      }

      return res
        .status(200)
        .json(new ApiResponse(200, {}, "Otp sent successfully!"));
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json(new ApiResponse(500, error, "Internal Server Error"));
    }
  }

  async verifyOTP(req: Request, res: Response) {
    try {
      const { channel } = req.params;
      const { otp, receiver } = req.body;
      if (!otp || !receiver) {
        return res
          .status(400)
          .json(new ApiResponse(400, {}, "All fields are required!"));
      }
      if (process.env.NODE_ENV === "production") {
        const verified = await this.notificationService.verifyOtp(
          otp,
          receiver,
          channel as "email" | "sms",
        );
        if (!verified) {
          return res
            .status(401)
            .json(new ApiResponse(401, {}, "Otp is incorrect or expired"));
        }
      }
      let data;
      if (channel === "email") {
        data = {
          is_email_verified: true,
        };
      } else {
        data = {
          is_phone_verified: true,
        };
      }
      let user;
      if (channel === "email") {
        user = await this.service.getUserByEmail(receiver);
      } else {
        user = await this.service.getUserByMobile(receiver);
      }
      const userId = user?.id;
      await this.service.updateUser(userId!, data);
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            {},
            `${channel === "email" ? "Email" : "Phone"} verified successfully`,
          ),
        );
    } catch (error) {
      return res
        .status(500)
        .json(new ApiResponse(500, error, "Internal Server Error"));
    }
  }

  // TODO: Add updateUserProfile controller method
  // TODO: Add deleteUser controller method
  // TODO: Add validate email controller method
  // TODO: Add validate phone number controller method
  // TODO: Add change password controller method
}

export default AuthController;
