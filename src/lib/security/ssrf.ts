import { URL } from "url";

// Block loopback, RFC 1918 private subnets, carrier-grade NAT, and cloud metadata
const BLOCKED_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);

export function isPrivateOrBlockedIp(hostname: string): boolean {
  if (BLOCKED_HOSTS.has(hostname.toLowerCase())) return true;

  // Cloud metadata endpoint
  if (hostname === "169.254.169.254") return true;

  // IPv4 private regex
  // 10.0.0.0/8
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
  // 172.16.0.0/12
  if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
  // 192.168.0.0/16
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
  // 127.0.0.0/8
  if (/^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;

  return false;
}

export function validateSafeUrl(urlString: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    throw new Error(`Invalid URL format: ${urlString}`);
  }

  // Scheme restriction: only HTTP and HTTPS
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`Restricted URL protocol '${parsed.protocol}'. Only HTTP/HTTPS allowed.`);
  }

  // Check hostname
  if (isPrivateOrBlockedIp(parsed.hostname)) {
    throw new Error(`Security policy blocked access to private/internal network host '${parsed.hostname}'.`);
  }

  return parsed;
}

/**
 * Safely fetches a remote URL with SSRF guards, timeout, and max size restriction.
 */
export async function safeFetchUrl(
  urlString: string,
  options?: { maxSizeBytes?: number; timeoutMs?: number }
): Promise<{ text: string; status: number; contentType: string }> {
  const safeUrl = validateSafeUrl(urlString);
  const maxBytes = options?.maxSizeBytes || 25000; // 25KB default
  const timeoutMs = options?.timeoutMs || 8000;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(safeUrl.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "VEYRA-Studio-ResearchBot/1.0 (+https://veyra.studio/bot)",
        Accept: "text/html,application/xhtml+xml,text/plain",
      },
    });

    clearTimeout(timeoutId);

    // Verify redirected URL if any
    if (res.url && res.url !== safeUrl.toString()) {
      validateSafeUrl(res.url);
    }

    const contentType = res.headers.get("content-type") || "text/plain";
    const rawBuffer = await res.arrayBuffer();

    // Check size restriction
    const slice = rawBuffer.slice(0, maxBytes);
    const text = new TextDecoder("utf-8").decode(slice);

    // Sanitize script, style, and iframe tags
    const sanitized = text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return {
      text: sanitized,
      status: res.status,
      contentType,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (controller.signal.aborted) {
      throw new Error(`Request to ${urlString} timed out after ${timeoutMs}ms.`);
    }
    throw err;
  }
}
