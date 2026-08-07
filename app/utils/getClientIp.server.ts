export function getClientIp(request: Request): string | null {
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp && cfConnectingIp.trim() !== "") {
    return cfConnectingIp.trim();
  }

  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (!xForwardedFor) {
    return null;
  }

  const firstIp = xForwardedFor.split(",")[0]?.trim();
  return firstIp && firstIp !== "" ? firstIp : null;
}
