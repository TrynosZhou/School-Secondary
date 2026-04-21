import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { AuthGuardService } from './auth-guard.service';
import { AuthService } from './auth.service';
import { ROLES } from '../registration/models/roles.enum';
import { selectIsLoggedIn, selectUser } from './store/auth.selectors';

describe('AuthGuardService', () => {
  let guard: AuthGuardService;
  let store: MockStore;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  const initialState = {
    auth: {
      isLoggedin: false,
      user: null,
    },
  };

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['getValidToken']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AuthGuardService,
        provideMockStore({ initialState }),
        { provide: AuthService, useValue: authSpy },
      ],
    });

    guard = TestBed.inject(AuthGuardService);
    store = TestBed.inject(MockStore);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
  });

  it('redirects to signin when token is invalid', (done) => {
    authService.getValidToken.and.returnValue(null);
    const route: any = { data: {} };

    const result = guard.canActivate(route, {} as any);
    if (
      result instanceof Promise ||
      typeof result === 'boolean' ||
      (result as any).root !== undefined
    ) {
      fail('Expected observable result');
      return;
    }

    (result as any).subscribe((value: any) => {
      expect(value).toEqual(router.parseUrl('/signin'));
      done();
    });
  });

  it('allows authorized role and required permission', (done) => {
    authService.getValidToken.and.returnValue('valid-token');
    store.overrideSelector(selectIsLoggedIn, true);
    store.overrideSelector(selectUser, {
      id: 'A1',
      username: 'john',
      role: ROLES.admin,
      permissions: ['system.manage.roles'],
    } as any);
    store.refreshState();

    const route: any = {
      data: {
        roles: [ROLES.admin],
        permissions: ['system.manage.roles'],
      },
    };

    const result = guard.canActivate(route, {} as any) as any;
    result.subscribe((value: any) => {
      expect(value).toBeTrue();
      done();
    });
  });

  it('redirects to dashboard when permission is missing', (done) => {
    authService.getValidToken.and.returnValue('valid-token');
    store.overrideSelector(selectIsLoggedIn, true);
    store.overrideSelector(selectUser, {
      id: 'A1',
      username: 'john',
      role: ROLES.admin,
      permissions: ['system.view.settings'],
    } as any);
    store.refreshState();

    const route: any = {
      data: {
        roles: [ROLES.admin],
        permissions: ['system.manage.roles'],
      },
    };

    const result = guard.canActivate(route, {} as any) as any;
    result.subscribe((value: any) => {
      expect(value).toEqual(router.parseUrl('/dashboard'));
      done();
    });
  });
});
