import { Response, NextFunction } from "express";
import jwt, { JwtPayload  } from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse";
import { AuthenticatedRequest } from "../types/request";

const middleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {

  const token =
    req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];
  if (!token) {
    const redirectUrl = encodeURIComponent(req.originalUrl);
    return res.redirect(
      `${process.env.FRONTEND_URL}/login?redirect=${redirectUrl}`
    );
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as JwtPayload;
    req.id = decoded.id as string;

    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.clearCookie("accessToken");

      const redirectUrl = encodeURIComponent(req.originalUrl);
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?redirect=${redirectUrl}`
      );
    }
    return res
      .status(401)
      .json(new ApiResponse(401, {}, "Unauthorized: Invalid token"));
  }
};

export default middleware;
