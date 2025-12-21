import { Request, Response } from "express";
import AuthService from "../service/auth.service";
import SessionService from "../service/session.service";
import {
  loginUserSchema,
  registerUserSchema,
} from "../validation/auth.validation";
import { ZodError } from "zod";
import { ApiResponse } from "../utils/ApiResponse";
import { generateToken } from "../utils/generateToken";

class AuthController {
  private service: AuthService;
  private sessionService: SessionService;
  constructor() {
    this.service = new AuthService();
    this.sessionService = new SessionService()
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
              "All fields are required and must be valid!"
            )
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
      const normalizedIp = normalizeIp(ipAddress)
      const { response, accessToken, refreshToken } =
        await this.service.loginUser(
          data.email || "",
          data.phone_no || "",
          data.ISD_code || "",
          data.password
        );
        if(response && accessToken && refreshToken){
          await this.sessionService.registerSession(response.data.id,refreshToken,userAgent,normalizedIp)
        }
      res
        .cookie("accessToken", accessToken, { httpOnly: true })
        .cookie("refreshToken", refreshToken, { httpOnly: true })
        .status(response.statusCode)
        .json(response);
    } catch (error) {
      if (error instanceof ZodError) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              error,
              "All fields are required and must be valid!"
            )
          );
      }
      return res
        .status(500)
        .json(new ApiResponse(500, error, "Internal server error!"));
    }
  }

  async logoutUser(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken
      await this.sessionService.deleteSession(refreshToken)
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

  async refresh(req: Request, res:Response){
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
      return res
        .status(401)
        .json(new ApiResponse(401, {}, "Refresh token missing"));
    }
    const session = await this.sessionService.getSessionByToken(refreshToken)
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

    await this.sessionService.deleteSession(refreshToken)
    const newAccessToken = generateToken({ id: req.userId, isAdmin: req.isAdmin }, "access")
    const newRefreshToken = generateToken({ id: req.userId, isAdmin: req.isAdmin }, "refresh")
    await this.sessionService.registerSession(session.userId, newRefreshToken, session.userAgent || "unknown" ,session.ipAddress || "unknown")
    res
        .cookie("accessToken", newAccessToken, { httpOnly: true })
        .cookie("refreshToken", newRefreshToken, { httpOnly: true })
        .status(200)
        .json(new ApiResponse(200, {}, "Refresh Token updated successfully"));
    } catch (error) {
      return res.status(500).json(new ApiResponse(500, error, "Internal Server Error"))
    }
  }

  // TODO: Add updateUserProfile controller method
  // TODO: Add deleteUser controller method
  // TODO: Add validate email controller method
  // TODO: Add validate phone number controller method
  // TODO: Add change password controller method
}

export default AuthController;
