import axios from "axios";
import AuthRepository from "../repository/auth.repo";
import TokenRepository from "../repository/token.repo";
import { expiresAtToExpiresIn } from "../utils/formatDateTime";
import { generateIDPToken } from "../utils/generateIDPToken";

class NotificationService {
  private tokenRepo: TokenRepository;
  private authRepo: AuthRepository;

  constructor() {
    this.tokenRepo = new TokenRepository();
    this.authRepo = new AuthRepository();
  }

  async sendOtpToEmail(email: string): Promise<boolean> {
    const notificationUri = process.env.NOTIFICATION_URI;
    if (!notificationUri) {
      throw new Error("NOTIFICATION_URI not configured");
    }

    const user = await this.authRepo.getUserByEmail(email);
    if (!user) {
      return false;
    }

    const { otp, expiresAt } = await this.tokenRepo.createOtp(user.id);

    const payload = {
      userId: user.id,
      clientId: "idp",
      reciever: email,
      eventType: "AUTH_OTP",
      data: {
        variables: {
          otp,
          expiresIn: expiresAtToExpiresIn(expiresAt),
          service: "IDP",
        },
      },
    };

    const token = generateIDPToken();

    try {
      const response = await axios.post(notificationUri, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 5000,
      });

      if (response.status !== 200) {
        throw new Error(`Notification service responded with ${response.status}`);
      }

      return true;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to send OTP email"
      );
    }
  }
}

export default NotificationService;
