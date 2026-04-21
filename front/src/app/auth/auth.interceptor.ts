import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

function getTenantSlug(): string {
  // Single-tenant deployment: always use configured tenant slug.
  return environment.tenantSlug || 'default';
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const tenantSlug = getTenantSlug();
    let reqWithTenant = req.clone({
      headers: req.headers.set('X-Tenant', tenantSlug),
    });

    const idToken = this.authService.getValidToken();

    if (idToken) {
      const cloned = reqWithTenant.clone({
        headers: reqWithTenant.headers.set('Authorization', 'Bearer ' + idToken),
      });

      return next.handle(cloned);
    } else {
      return next.handle(reqWithTenant);
    }
  }
}
