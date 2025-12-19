import { createPublicKey } from "crypto";

export function pemToJwk(pem: string) {
  const keyObject = createPublicKey(pem);
  const jwk = keyObject.export({ format: "jwk" });
  return jwk;
}
