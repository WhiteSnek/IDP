import { UAParser } from "ua-parser-js";

export function formatUserAgent(ua?: string | null): string {
  if (!ua) return "Unknown device";

  const parser = new UAParser(ua);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();

  const browserName = browser.name ?? "Unknown Browser";
  const osName = os.name ?? "Unknown OS";

  // Mobile detection
  if (device.type === "mobile") {
    return `${browserName} · Mobile`;
  }

  if (device.type === "tablet") {
    return `${browserName} · Tablet`;
  }

  return `${browserName} · ${osName}`;
}
