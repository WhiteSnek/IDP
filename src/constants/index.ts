import { CookieOptions } from "express";

export const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
};

export const ALL_CHANNELS = ["email", "sms", "whatsapp", "push"];

export const NOTIFICATION_PERMISSION = true;
