import { CookieOptions } from "express";

export const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: false,
};
