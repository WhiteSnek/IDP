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

export function expiresInToExpiresAt(expiresIn: string): Date | null {
  if (expiresIn === "expired") return null;

  const now = Date.now();

  const match = expiresIn.match(/^(\d+)\s(second|seconds|minute|minutes)$/);
  if (!match) {
    throw new Error("Invalid expiresIn format");
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  let diffMs = 0;

  if (unit.startsWith("minute")) {
    diffMs = value * 60 * 1000;
  } else if (unit.startsWith("second")) {
    diffMs = value * 1000;
  }

  return new Date(now + diffMs);
}
