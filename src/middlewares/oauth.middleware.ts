import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/request";

const client = jwksClient({
  jwksUri: "http://localhost:3000/oauth/.well-known/jwks.json",
});

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    callback(err, key?.getPublicKey());
  });
}

export const oauthAuthMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Missing access token" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(
    token,
    getKey,
    {
      issuer: "http://localhost:3000",
    },
    (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }

      req.id = decoded?.sub as string;
      next();
    }
  );
};
