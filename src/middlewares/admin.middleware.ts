import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/request";

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({
      message: "Admin access required",
    });
  }

  next();
};
