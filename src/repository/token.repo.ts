import { prisma } from "../config";
import crypto from "crypto";
class TokenRepository {
  async createOtp(userId: string) {
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.verificationTokens.create({
      data: {
        userId,
        token: otp,
        type: "OTP",
        expiresAt,
      },
    });
    return { otp, expiresAt };
  }

  async findOtp(otp: string, userId: string) {
    return await prisma.verificationTokens.findFirst({
      where: {
        token: otp,
        userId,
      },
      select: {
        expiresAt: true,
        id: true,
      },
    });
  }

  async deleteOtp(id: string) {
    await prisma.verificationTokens.delete({
      where: { id },
    });
  }
}

export default TokenRepository;
