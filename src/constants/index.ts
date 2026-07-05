import { CookieOptions } from "express";

export const COOKIE_OPTIONS: CookieOptions =
  process.env.NODE_ENV === "production"
    ? {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        domain: ".whitesnek.xyz",
        path: "/",
      }
    : {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
      };

export const ALL_CHANNELS = ["email", "sms", "whatsapp", "push"];

export const NOTIFICATION_PERMISSION = true;