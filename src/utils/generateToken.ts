import jwt, { SignOptions } from "jsonwebtoken";

const generateToken = (payload: object,type: "access"| "refresh") => {
    if(type == "access"){
        if(!process.env.ACCESS_TOKEN_SECRET)
            throw new Error("ACCESS_TOKEN_SECRET is not defined in environment variables");
        if(!process.env.ACCESS_TOKEN_EXPIRES_IN)
            throw new Error("ACCESS_TOKEN_EXPIRES_IN is not defined in environment variables");
    }
    if(type == "refresh"){
        if(!process.env.REFRESH_TOKEN_SECRET)
            throw new Error("REFRESH_TOKEN_SECRET is not defined in environment variables");
        if(!process.env.REFRESH_TOKEN_EXPIRES_IN)
            throw new Error("REFRESH_TOKEN_EXPIRES_IN is not defined in environment variables");
    }
    const expiresIn = type == "access" ? process.env.ACCESS_TOKEN_EXPIRES_IN : process.env.REFRESH_TOKEN_EXPIRES_IN;
    const secret = type == "access" ? process.env.ACCESS_TOKEN_SECRET : process.env.REFRESH_TOKEN_SECRET;
  return jwt.sign(
    payload,
    secret as string,
    { expiresIn: expiresIn as SignOptions["expiresIn"] }
  );
};

export default generateToken;
