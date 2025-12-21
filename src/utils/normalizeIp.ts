export function normalizeIp(ip?: string | null): string {
  if (!ip) return "unknown";

  // Handle IPv4-mapped IPv6
  if (ip.startsWith("::ffff:")) {
    return ip.replace("::ffff:", "");
  }

  // Handle IPv6 loopback
  if (ip === "::1") {
    return "127.0.0.1";
  }

  return ip;
}
