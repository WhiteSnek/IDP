import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config";

const middleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token =
    req.cookies?.accessToken ||
    req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        isAdmin: true
      },
    });
    if (!user) {
      return res.status(401).json({
        message: "Invalid session",
      });
    }

    req.userId = user.id;
    req.isAdmin = user.isAdmin;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

export default middleware;