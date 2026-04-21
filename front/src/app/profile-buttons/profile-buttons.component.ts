// src/app/profile-buttons/profile-buttons.component.ts
import { Component, Input } from '@angular/core'; // Removed EventEmitter, Output as not used
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { logout } from '../auth/store/auth.actions'; // Adjusted path: assuming auth.actions is sibling to auth.reducer/state
import { Router } from '@angular/router';
import { selectAuthUserRole, selectUserDisplayName } from '../auth/store/auth.selectors';
// REMOVED: MatMenuModule import here. It belongs in app.module.ts or a shared Material module.

@Component({
  selector: 'app-profile-buttons',
  templateUrl: './profile-buttons.component.html', // Points to the external HTML file
  styleUrls: ['./profile-buttons.component.css'],
})
export class ProfileButtonsComponent {
  // Input: isLoggedIn status from the parent component (app.component)
  @Input()
  isLoggedIn!: boolean | null;

  userRole$: Observable<string | undefined> = this.store.select(selectAuthUserRole);
  userDisplayName$: Observable<string | null> = this.store.select(selectUserDisplayName);

  constructor(private store: Store, private router: Router) {}

  /** True when already on signin page – hide Sign In button to avoid redundant link */
  get isOnSigninPage(): boolean {
    return this.router.url.startsWith('/signin');
  }

  onLogout(): void {
    this.store.dispatch(logout());
  }

  onProfile(): void {
    this.router.navigateByUrl('/profile');
  }

  switchToSignin(): void {
    this.router.navigateByUrl('/signin');
  }
}
