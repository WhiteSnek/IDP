import { Request } from "express";

interface User {
    id: string;
    email: string;
    isAdmin: boolean;
}

export interface AuthRequest extends Request {
  user: User;
}

export interface OAuthRequest extends Request {
  id: string;
}
