import jwt, { SignOptions } from "jsonwebtoken";
import { createPrivateKey } from "crypto";

const generateToken = (payload: object, type: "access" | "refresh") => {
  if (type == "access") {
    if (!process.env.ACCESS_TOKEN_SECRET)
      throw new Error(
        "ACCESS_TOKEN_SECRET is not defined in environment variables"
      );
    if (!process.env.ACCESS_TOKEN_EXPIRES_IN)
      throw new Error(
        "ACCESS_TOKEN_EXPIRES_IN is not defined in environment variables"
      );
  }
  if (type == "refresh") {
    if (!process.env.REFRESH_TOKEN_SECRET)
      throw new Error(
        "REFRESH_TOKEN_SECRET is not defined in environment variables"
      );
    if (!process.env.REFRESH_TOKEN_EXPIRES_IN)
      throw new Error(
        "REFRESH_TOKEN_EXPIRES_IN is not defined in environment variables"
      );
  }
  const expiresIn =
    type == "access"
      ? process.env.ACCESS_TOKEN_EXPIRES_IN
      : process.env.REFRESH_TOKEN_EXPIRES_IN;
  const secret =
    type == "access"
      ? process.env.ACCESS_TOKEN_SECRET
      : process.env.REFRESH_TOKEN_SECRET;
  return jwt.sign(payload, secret as string, {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  });
};

const generateOAuthToken = (
  payload: object,
  options: {
    audience: string;
    expiresIn: number;
  }
) => {
  if (!process.env.IDP_PRIVATE_KEY) throw new Error("IDP_PRIVATE_KEY not set");

  const privateKey = createPrivateKey({
    key: process.env.IDP_PRIVATE_KEY as string,
    format: "pem",
  });

  const signOptions: SignOptions = {
    algorithm: "RS256",
    expiresIn: options.expiresIn,
    issuer: process.env.IDP_URI,
    audience: options.audience,
    keyid: "idp-key-1",
  };

  return jwt.sign(payload, privateKey, signOptions);
};

export {generateToken, generateOAuthToken};
