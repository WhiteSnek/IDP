import SessionRepository from "../repository/session.repo";
import { SessionType } from "../types/session";
import { getExpiryDate } from "../utils/getExpiryDate";
import { hashToken } from "../utils/hashToken";

class SessionService {
  private repository: SessionRepository;
  constructor() {
    this.repository = new SessionRepository();
  }
  async registerSession(
    userId: string,
    refreshToken: string,
    userAgent: string,
    ipAddress: string
  ) {
    const expiryTime = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";
    const expiresAt = getExpiryDate(expiryTime);

    const hashedRefreshToken = hashToken(refreshToken);

    const data: SessionType = {
      userId,
      refreshToken: hashedRefreshToken,
      userAgent,
      ipAddress,
      expiresAt,
    };

    await this.repository.registerSession(data);
  }

  async deleteSession(refreshToken: string){
    const hashed = hashToken(refreshToken)
    await this.repository.deleteSession(hashed)
  }

  async getSessionByToken(refreshToken: string){
    const hashed = hashToken(refreshToken)
    return await this.repository.getSessionByToken(hashed)
  }

  async getUserSessions(userId: string){
    return await this.repository.getUserSessions(userId)
  }

}

export default SessionService;
