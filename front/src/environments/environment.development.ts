export const environment = {
  apiUrl: 'http://localhost:3000',
  defaultTenantHosts: ['localhost', '127.0.0.1'],
  /** Leave unset in dev so you can test with default/localhost; set in prod per deployment. */
  tenantSlug: undefined as string | undefined,
};
