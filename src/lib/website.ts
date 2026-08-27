export function isPublicHttpUrl(value?: string | null) {
  if (!value) return false;

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;

    const host = url.hostname.toLowerCase();
    if (!host) return false;

    const blockedSuffixes = [".example", ".invalid", ".test", ".localhost"];
    if (host === "localhost" || blockedSuffixes.some((suffix) => host.endsWith(suffix))) {
      return false;
    }

    if (host === "127.0.0.1" || host === "0.0.0.0" || host === "::1") return false;
    if (/^10\./.test(host)) return false;
    if (/^192\.168\./.test(host)) return false;
    if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return false;

    return true;
  } catch {
    return false;
  }
}
