import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SigninInterface } from './models/signin.model';
import { Observable } from 'rxjs';
import { SignupInterface } from './models/signup.model';
import { AccountStats } from './models/account-stats.model';
import { environment } from 'src/environments/environment';
import jwt_decode from 'jwt-decode';
import { User } from './models/user.model';
import { StudentsModel } from '../registration/models/students.model';
import { TeachersModel } from '../registration/models/teachers.model';
import { ParentsModel } from '../registration/models/parents.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly tokenKey = 'token';
  private readonly userKey = 'user';
  private readonly legacySessionKey = 'jhs_session';
  private readonly tenantKey = 'tenantSlug';

  constructor(
    private http: HttpClient // private router: Router, // private store: Store
  ) {}

  private baseUrl = `${environment.apiUrl}/auth/`;

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  clearAuthSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.legacySessionKey);
    localStorage.removeItem(this.tenantKey);
  }

  setToken(accessToken: string): void {
    localStorage.setItem(this.tokenKey, accessToken);
  }

  setTenantSlug(tenantSlug?: string): void {
    localStorage.setItem(this.tenantKey, tenantSlug || 'default');
  }

  decodeToken(token: string): User | null {
    try {
      return jwt_decode<User>(token);
    } catch {
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded?.exp) return true;
    return decoded.exp * 1000 < Date.now();
  }

  getValidToken(): string | null {
    const token = this.getToken();
    if (!token) return null;
    if (this.isTokenExpired(token)) {
      this.clearAuthSession();
      return null;
    }
    return token;
  }

  getAuthStatus(): { isLoggedIn: boolean; user?: User; accessToken?: string } {
    const token = this.getValidToken();
    if (!token) {
      return { isLoggedIn: false };
    }

    const user = this.decodeToken(token);
    if (!user) {
      this.clearAuthSession();
      return { isLoggedIn: false };
    }

    return { isLoggedIn: true, user, accessToken: token };
  }

  signin(signinData: SigninInterface): Observable<{ accessToken: string; permissions: string[] }> {
    return this.http.post<{ accessToken: string; permissions: string[] }>(
      this.baseUrl + 'signin',

      signinData
    );
  }

  signup(signupData: SignupInterface): Observable<{ response: boolean }> {
    return this.http.post<{ response: boolean }>(
      this.baseUrl + 'signup',
      signupData
    );
  }

  getAccountsStats(): Observable<AccountStats> {
    return this.http.get<AccountStats>(this.baseUrl);
  }

  fetchUserDetails(
    id: string,
    role: string
  ): Observable<StudentsModel | TeachersModel | ParentsModel> {
    return this.http.get<StudentsModel | TeachersModel | ParentsModel>(
      `${this.baseUrl}${id}/${role}`
    );
  }

  getUserPermissions(accountId: string): Observable<{ permissions: string[] }> {
    return this.http.get<{ permissions: string[] }>(
      `${environment.apiUrl}/system/roles-permissions/user/${accountId}/permissions`
    );
  }
}
