import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse";
import { AuthenticatedRequest } from "../types/request";

const middleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
    if (!token) {
        const redirectUrl = encodeURIComponent(req.originalUrl);
        return res.redirect(
        `${process.env.FRONTEND_URL}/login?redirect=${redirectUrl}`
        );
    }
    try {
        const userId = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);
        req.id = (userId as any).id;
        next();
    } catch (error) {
        return res.status(401).json(new ApiResponse(401, {}, "Unauthorized: Invalid token"));
    }
}

export default middleware;