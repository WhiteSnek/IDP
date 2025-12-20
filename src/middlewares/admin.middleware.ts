import { Request, Response, NextFunction } from "express";

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.isAdmin) {
    return res.status(403).json({
      message: "Admin access required",
    });
  }

  next();
};
