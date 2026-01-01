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

  async sendOtp(receiver: string, channel: "email" | "sms"): Promise<boolean> {
    const notificationUri = process.env.NOTIFICATION_URI;
    if (!notificationUri) {
      throw new Error("NOTIFICATION_URI not configured");
    }
    let user = null;
    if(channel === 'email'){
      user = await this.authRepo.getUserByEmail(receiver);
      if (!user) {
        return false;
      }
    } else {
      user = await this.authRepo.getUserByMobile(receiver);
      if (!user) {
        return false;
      }
    }
    const { otp, expiresAt } = await this.tokenRepo.createOtp(user.id);

    const payload = {
      userId: user.id,
      clientId: "idp",
      reciever: receiver,
      eventType: "AUTH_OTP",
      data: {
        variables: {
          otp,
          expiresIn: expiresAtToExpiresIn(expiresAt),
          service: "IDP",
        },
      },
      channels: [channel],
      priority: "high"
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

  async verifyOtp(otp: string, receiver: string, channel: "email" | "sms"): Promise<boolean>{
    let user = null;
    if(channel === 'email'){
      user = await this.authRepo.getUserByEmail(receiver);
      if (!user) {
        return false;
      }
    } else {
      user = await this.authRepo.getUserByMobile(receiver);
      if (!user) {
        return false;
      }
    }
    const userId = user.id
    const entry = await this.tokenRepo.findOtp(otp, userId)
    if(!entry){
        return false;
    }
    if(entry.expiresAt < new Date()){
        return false
    }
    await this.tokenRepo.deleteOtp(entry.id)
    return true;
  }
}

export default NotificationService;
