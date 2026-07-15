// src/common/tenant/TenantContext.ts
/**
 * Utility to obtain the current tenant identifier from the request context.
 * Assumes JWT payload contains a `tenant_id` claim set by authentication middleware.
 */
export class TenantContext {
  static getCurrentTenantId(): string {
    // In a real implementation this would pull from a request-scoped store.
    // Here we fallback to an environment variable for simplicity.
    const tenantId = process.env.DEFAULT_TENANT_ID;
    if (!tenantId) {
      throw new Error('Tenant ID not configured');
    }
    return tenantId;
  }
}
