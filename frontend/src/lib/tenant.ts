const MULTI_TENANT_ENABLED = false;
let cachedTenant: string | null = null;

const DEFAULT_TENANT = process.env.NEXT_PUBLIC_DEFAULT_TENANT || 'default';
const BASE_DOMAIN = process.env.NEXT_PUBLIC_TENANT_BASE_DOMAIN;

export function getTenantSlug(): string {
  if (!MULTI_TENANT_ENABLED) {
    return '';
  }

  if (cachedTenant) return cachedTenant;

  if (typeof window !== 'undefined') {
    const host = window.location.host;
    const params = new URLSearchParams(window.location.search);
    const queryTenant = params.get('tenant');
    if (queryTenant) {
      cachedTenant = queryTenant;
      return cachedTenant;
    }

    if (BASE_DOMAIN && host.endsWith(BASE_DOMAIN)) {
      const subdomain = host.replace(`.${BASE_DOMAIN}`, '').split('.')[0];
      if (subdomain && subdomain !== 'www') {
        cachedTenant = subdomain;
        return cachedTenant;
      }
    }
  }

  cachedTenant = DEFAULT_TENANT;
  return cachedTenant;
}

export function tenantHeaders(): Record<string, string> {
  if (!MULTI_TENANT_ENABLED) {
    return {};
  }

  const slug = getTenantSlug();
  return slug ? { 'x-tenant-id': slug } : {};
}
