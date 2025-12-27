import { CookieOptions } from "express";

export const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: false,
};

export const ALL_CHANNELS = ["email", "sms", "whatsapp", "push"]

export const NOTIFICATION_PERMISSION = true