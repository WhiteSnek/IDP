import { Request, Response } from "express";
import AuthService from "../service/auth.service";
import { loginUserSchema, registerUserSchema } from "../validation/auth.validation";
import { ZodError } from "zod";
import { ApiResponse } from "../utils/ApiResponse";
import { AuthenticatedRequest } from "../types/request";

class AuthController {
  private service: AuthService;
  constructor() {
    this.service = new AuthService();
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
      const { response, accessToken, refreshToken } =
        await this.service.loginUser(
          data.email || "",
          data.phone_no || "",
          data.ISD_code || "",
          data.password
        );
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

  async logoutUser(req: AuthenticatedRequest, res: Response) {
    try {
        return res.cookie("accessToken", "", { httpOnly: true, maxAge: 0 })
           .cookie("refreshToken", "", { httpOnly: true, maxAge: 0 })
           .status(200)
           .json(new ApiResponse(200, {}, "Logout successful"));
    } catch (error) {
        return res
        .status(500)
        .json(new ApiResponse(500, error, "Internal server error!"));
    }
  }

  async getUserProfile(req: AuthenticatedRequest, res: Response) {
    try {
        const response = await this.service.getUserProfile(req.id!);
        return res.status(response.statusCode).json(response);
    } catch (error) {
        return res
        .status(500)
        .json(new ApiResponse(500, error, "Internal server error!"));
    }
  }
  // TODO: Add updateUserProfile controller method
  // TODO: Add deleteUser controller method
  // TODO: Add validate email controller method
  // TODO: Add validate phone number controller method
  // TODO: Add change password controller method
}

export default AuthController;
