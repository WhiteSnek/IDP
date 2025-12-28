export function expiresAtToExpiresIn(expiresAt: Date): string {
  const now = Date.now();
  const diffMs = expiresAt.getTime() - now;

  if (diffMs <= 0) return "expired";

  const totalSeconds = Math.floor(diffMs / 1000);

  const minutes = Math.floor(totalSeconds / 60);
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  }

  const seconds = totalSeconds % 60;
  return `${seconds} second${seconds > 1 ? "s" : ""}`;
}
