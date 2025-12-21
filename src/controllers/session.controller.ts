import { Request, Response } from "express";
import SessionService from "../service/session.service";
import { ApiResponse } from "../utils/ApiResponse";

class SessionController {
  private service: SessionService;
  constructor() {
    this.service = new SessionService();
  }

  async getUserSessions(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const now = new Date();
      const currentUserAgent = req.get("user-agent") ?? "unknown";
      const currentIp =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.socket.remoteAddress ||
        "unknown";
      const normalizedCurrentIp = normalizeIp(currentIp);
      const sessions = await this.service.getUserSessions(userId!);
      const response = sessions.map((session) => {
        const isExpired = session.expiresAt <= now;

        return {
          id: session.id,
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
          userAgent: session.userAgent,
          ipAddress: session.ipAddress,
          isExpired,
          isCurrentSession:
            !isExpired &&
            session.userAgent === currentUserAgent &&
            session.ipAddress === normalizedCurrentIp,
        };
      });

      return res
        .status(200)
        .json(new ApiResponse(200, response, "Sessions fetched successfully!"));
    } catch (error) {
      return res
        .status(500)
        .json(new ApiResponse(500, error, "Something went wrong!"));
    }
  }
}

export default SessionController;
