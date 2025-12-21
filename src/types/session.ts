export interface SessionType {
    userId: string;
    refreshToken: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
}