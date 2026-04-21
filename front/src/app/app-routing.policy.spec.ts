import { Route } from '@angular/router';
import { APP_ROUTES } from './app-routing.module';

function findRoute(path: string): Route | undefined {
  return APP_ROUTES.find((route) => route.path === path);
}

describe('Route policy coverage', () => {
  const criticalProtectedPaths = [
    'system/departments',
    'system/academic',
    'system/settings',
    'system/audit',
    'system/analytics',
    'system/integrations',
  ];

  for (const path of criticalProtectedPaths) {
    it(`enforces roles/permissions metadata for ${path}`, () => {
      const route = findRoute(path);
      expect(route).toBeDefined();
      expect(route?.canActivate).toBeDefined();
      expect(route?.data).toBeDefined();
      expect(route?.data?.['roles'] || route?.data?.['permissions']).toBeTruthy();
    });
  }
});
