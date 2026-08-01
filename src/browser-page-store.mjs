const pages = new Map();

function purgeExpired(now = Date.now()) {
  for (const [scope, item] of pages.entries()) {
    if (item.expiresAt <= now) pages.delete(scope);
  }
}

export function browserPageScope(principal, clientId) {
  return `${principal.principalType}:${principal.principalId}:${clientId}`;
}

export function storeBrowserPage(scope, page, ttlMs) {
  const now = Date.now();
  purgeExpired(now);
  const expiresAt = now + ttlMs;
  pages.set(scope, { page, expiresAt });
  return { expiresAt };
}

export function getBrowserPage(scope) {
  purgeExpired();
  const item = pages.get(scope);
  if (!item) return null;
  return { ...item.page, expiresAt: item.expiresAt };
}

export function clearBrowserPages() {
  pages.clear();
}
