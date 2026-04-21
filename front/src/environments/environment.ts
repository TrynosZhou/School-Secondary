/**
 * Production environment for the front-mu-five deployment.
 * URL: https://front-mu-five.vercel.app
 * This deployment is fixed to tenant "default" (first school). No school selector.
 */
export const environment = {
  apiUrl: 'https://server-cv68.onrender.com',
  defaultTenantHosts: ['front-mu-five.onrender.com', 'front-mu-five.vercel.app'],
  tenantSlug: 'default',
};
