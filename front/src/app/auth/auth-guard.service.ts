import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, combineLatest } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { selectIsLoggedIn, selectUser } from './store/auth.selectors';
import { ROLES } from '../registration/models/roles.enum';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService {
  constructor(
    private store: Store,
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    if (!this.authService.getValidToken()) {
      return this.router.parseUrl('/signin');
    }

    const allowedRoles = route.data?.['roles'] as readonly ROLES[] | undefined;
    const requiredPermissions = route.data?.['permissions'] as readonly string[] | undefined;

    return combineLatest([
      this.store.select(selectIsLoggedIn),
      this.store.select(selectUser),
    ]).pipe(
      take(1),
      map(([isLoggedIn, user]) => {
        if (!isLoggedIn || !user) {
          return this.router.parseUrl('/signin');
        }

        // Admin and dev have full frontend route access.
        if ([ROLES.admin, ROLES.dev].includes(user.role as ROLES)) {
          return true;
        }

        if (!allowedRoles || allowedRoles.length === 0) {
          if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
          }
        } else if (!allowedRoles.includes(user.role as ROLES)) {
          return this.router.parseUrl('/dashboard');
        }

        if (requiredPermissions && requiredPermissions.length > 0) {
          const userPermissions = user.permissions || [];
          const hasAllPermissions = requiredPermissions.every((permission) =>
            userPermissions.includes(permission)
          );
          if (!hasAllPermissions) {
            return this.router.parseUrl('/dashboard');
          }
        }

        return true;
      })
    );
  }
}
