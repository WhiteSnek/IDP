export function getExpiryDate(expiresIn: string): Date {
  const now = Date.now();

  const value = parseInt(expiresIn.slice(0, -1), 10);
  const unit = expiresIn.slice(-1);

  let ms = 0;

  switch (unit) {
    case "d":
      ms = value * 24 * 60 * 60 * 1000;
      break;
    case "h":
      ms = value * 60 * 60 * 1000;
      break;
    case "m":
      ms = value * 60 * 1000;
      break;
    default:
      throw new Error("Invalid REFRESH_TOKEN_EXPIRES_IN format");
  }

  return new Date(now + ms);
}
