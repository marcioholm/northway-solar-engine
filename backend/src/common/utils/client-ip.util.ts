export function clientIp(req: any): string {
  if (!req) return '';

  const vercelHeader =
    req.headers?.['x-vercel-forwarded-for'] ??
    (typeof req.header === 'function' ? req.header('x-vercel-forwarded-for') : undefined);
  if (vercelHeader) {
    const firstIp = String(vercelHeader).split(',')[0].trim();
    if (firstIp) return firstIp;
  }

  const forwardedHeader =
    req.headers?.['x-forwarded-for'] ??
    (typeof req.header === 'function' ? req.header('x-forwarded-for') : undefined);
  if (forwardedHeader) {
    const firstIp = String(forwardedHeader).split(',')[0].trim();
    if (firstIp) return firstIp;
  }

  const directIp = req.ip ?? req.connection?.remoteAddress ?? req.socket?.remoteAddress;
  return typeof directIp === 'string' ? directIp.trim() : '';
}
