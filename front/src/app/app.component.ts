import {
  Component,
  ViewChild,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Observable, Subject, of, combineLatest } from 'rxjs';
import { takeUntil, map, shareReplay, catchError, filter, take } from 'rxjs/operators';
import { MediaMatcher } from '@angular/cdk/layout';
import { Store } from '@ngrx/store';
import {
  selectHasLinkedChildrenProfile,
  selectIsLoggedIn,
  selectIsParent,
  selectUser,
  selectUserDetails,
} from './auth/store/auth.selectors';
import { checkAuthStatus, userDetailsActions } from './auth/store/auth.actions';
import { ThemeService, Theme } from './services/theme.service';
import { RoleAccessService } from './services/role-access.service';
import { ROLES } from './registration/models/roles.enum';
import { SystemSettingsService, SystemSettings } from './system/services/system-settings.service';
import { Title } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { Router, NavigationEnd } from '@angular/router';
import { MessagingService } from './messaging/services/messaging.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'School';
  
  currentTheme: Theme = 'light';
  
  // School information from system settings
  schoolName$!: Observable<string>;
  schoolLogo$!: Observable<string>;
  schoolNameAbbr$!: Observable<string>;

  @ViewChild('sidenav') sidenav!: MatSidenav;

  isSidenavCollapsed: boolean = true; // Initial state: collapsed on large screens
  isScreenSmall: boolean = false;

  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  user$ = this.store.select(selectUser);
  role!: string;
  effectiveRole: string | null = null;
  isLoggedIn$: Observable<boolean>; // Simulate logged-in state, typically from an auth service
  isLoggedInStatus!: boolean; // Store the actual boolean status for TS logic
  isAuthenticatedDev$: Observable<boolean>;
  
  // Messaging unread count
  totalUnreadCount = 0;
  searchQuery = '';
  isCommandPaletteOpen = false;
  isStudentOrParentNav = false;

  quickNavItems = [
    { id: 'dashboard', label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
    { id: 'finance', label: 'Finance Overview', route: '/student-financials', icon: 'account_balance_wallet' },
    { id: 'reports', label: 'Reports', route: '/reports', icon: 'receipt_long' },
    { id: 'messages', label: 'Messages', route: '/messaging', icon: 'message' },
    { id: 'calendar', label: 'Calendar', route: '/calendar', icon: 'calendar_today' },
  ];
  recentNavIds: string[] = [];
  favoriteNavIds: string[] = [];
  private readonly recentStorageKey = 'jhs_nav_recents';
  private readonly favoriteStorageKey = 'jhs_nav_favorites';
  readonly devViewRoleOptions: ROLES[] = [
    ROLES.teacher,
    ROLES.student,
    ROLES.parent,
    ROLES.admin,
    ROLES.reception,
    ROLES.hod,
    ROLES.seniorTeacher,
    ROLES.deputy,
    ROLES.head,
    ROLES.auditor,
    ROLES.director,
  ];
  selectedDevViewRole: ROLES | null = null;

  // Role-based access observables - these update when role changes
  canAccessRegistration$ = this.roleAccess.getCurrentRole$().pipe(
    map(role => this.roleAccess.hasAnyRole(role, ROLES.admin, ROLES.reception, ROLES.director))
  );
  canAccessEnrolment$ = this.roleAccess.getCurrentRole$().pipe(
    map(role => this.roleAccess.doesNotHaveRole(role, ROLES.student, ROLES.parent))
  );
  canAccessAttendance$ = this.roleAccess.getCurrentRole$().pipe(
    map(role => this.roleAccess.hasAnyRole(role, ROLES.admin, ROLES.teacher, ROLES.hod))
  );
  canAccessMarks$ = this.roleAccess.getCurrentRole$().pipe(
    map(role => this.roleAccess.hasAnyRole(role, ROLES.admin, ROLES.teacher, ROLES.hod, ROLES.dev))
  );
  canAccessMarksDiagnostics$ = this.roleAccess.getCurrentRole$().pipe(
    map(role => this.roleAccess.hasAnyRole(role, ROLES.admin, ROLES.dev))
  );
  canAccessResultsAnalysis$ = this.roleAccess.getCurrentRole$().pipe(
    map(role => this.roleAccess.hasAnyRole(role, ROLES.admin, ROLES.teacher, ROLES.hod, ROLES.director))
  );
  canAccessBilling$ = this.roleAccess.getCurrentRole$().pipe(
    map(role => this.roleAccess.hasAnyRole(role, ROLES.reception, ROLES.director, ROLES.auditor))
  );
  canAccessReceipting$ = this.roleAccess.getCurrentRole$().pipe(
    map(role => this.roleAccess.hasAnyRole(role, ROLES.auditor, ROLES.director))
  );
  canAccessFinancialReports$ = this.roleAccess.getCurrentRole$().pipe(
    map(role =>
      this.roleAccess.hasAnyRole(
        role,
        ROLES.dev,
        ROLES.reception,
        ROLES.auditor,
        ROLES.director,
      ),
    )
  );
  canAccessExecutiveAnalytics$ = this.roleAccess.getCurrentRole$().pipe(
    map(role => this.roleAccess.hasAnyRole(role, ROLES.admin, ROLES.dev, ROLES.auditor, ROLES.director))
  );
  canAccessRequisitions$ = this.roleAccess.getCurrentRole$().pipe(
    map(role =>
      this.roleAccess.hasAnyRole(
        role,
        ROLES.dev,
        ROLES.admin,
        ROLES.director,
        ROLES.auditor,
        ROLES.deputy,
        ROLES.head,
        ROLES.hod,
        ROLES.seniorTeacher,
      ),
    ),
  );
  canAccessInventory$ = this.roleAccess.getCurrentRole$().pipe(
    map((role) =>
      this.roleAccess.hasAnyRole(
        role,
        ROLES.dev,
        ROLES.admin,
        ROLES.director,
        ROLES.auditor,
        ROLES.head,
        ROLES.deputy,
        ROLES.hod,
        ROLES.seniorTeacher,
        ROLES.teacher,
      ),
    ),
  );
  canAccessLibrary$ = this.roleAccess.getCurrentRole$().pipe(
    map((role) =>
      this.roleAccess.hasAnyRole(
        role,
        ROLES.dev,
        ROLES.admin,
        ROLES.director,
        ROLES.auditor,
        ROLES.head,
        ROLES.deputy,
        ROLES.hod,
        ROLES.seniorTeacher,
        ROLES.teacher,
      ),
    ),
  );
  canAccessIncidents$ = this.roleAccess.getCurrentRole$().pipe(
    map((role) =>
      this.roleAccess.hasAnyRole(
        role,
        ROLES.dev,
        ROLES.admin,
        ROLES.director,
        ROLES.auditor,
        ROLES.head,
        ROLES.deputy,
        ROLES.hod,
        ROLES.seniorTeacher,
        ROLES.teacher,
      ),
    ),
  );
  canAccessSystemAdmin$ = this.roleAccess.getCurrentRole$().pipe(
    map(role => this.roleAccess.hasAnyRole(role, ROLES.admin, ROLES.dev))
  );
  canAccessClassLists$ = this.roleAccess.getCurrentRole$().pipe(
    map(role => this.roleAccess.hasAnyRole(role, ROLES.admin, ROLES.reception, ROLES.teacher, ROLES.hod, ROLES.auditor, ROLES.director))
  );
  canAccessStudentBalances$ = this.roleAccess.getCurrentRole$().pipe(
    map(role => this.roleAccess.hasRole(ROLES.reception, role))
  );
  canAccessExemptions$ = this.roleAccess.getCurrentRole$().pipe(
    map(role => this.roleAccess.hasAnyRole(role, ROLES.auditor, ROLES.director))
  );
  canAccessRevenueRecognition$ = this.roleAccess.getCurrentRole$().pipe(
    map(role => this.roleAccess.hasAnyRole(role, ROLES.auditor, ROLES.director))
  );
  canAccessFeesCollection$ = this.roleAccess.getCurrentRole$().pipe(
    map(role => this.roleAccess.hasAnyRole(role, ROLES.auditor, ROLES.director))
  );
  
  // Helper methods for specific role checks
  isAdmin$ = this.roleAccess.getCurrentRole$().pipe(
    map(role => this.roleAccess.hasRole(ROLES.admin, role))
  );
  isReception$ = this.roleAccess.getCurrentRole$().pipe(
    map(role => this.roleAccess.hasRole(ROLES.reception, role))
  );
  isStudent$ = this.roleAccess.getCurrentRole$().pipe(
    map(role => this.roleAccess.hasRole(ROLES.student, role))
  );
  isParent$ = this.roleAccess.getCurrentRole$().pipe(
    map(role => this.roleAccess.hasRole(ROLES.parent, role))
  );
  /** True when user role is parent (case-insensitive). Used for Finance overview and parent views. */
  isParentRole$ = this.store.select(selectIsParent);
  /**
   * True when the logged-in account has any linked children profile information,
   * regardless of whether their primary role is parent, teacher, or dev.
   * Used to expose student-style finance views for teacher/dev accounts that
   * also act as parents.
   */
  hasLinkedChildrenProfile$ = this.store.select(selectHasLinkedChildrenProfile);

  private destroy$ = new Subject<void>();

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private media: MediaMatcher,
    private store: Store,
    public themeService: ThemeService,  // Made public for template access
    public roleAccess: RoleAccessService,  // Made public for template access
    public router: Router,  // Made public for template access
    private systemSettingsService: SystemSettingsService,
    private titleService: Title,
    private dialog: MatDialog,
    private messagingService: MessagingService
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 767px)');
    this._mobileQueryListener = () => {
      this.changeDetectorRef.detectChanges();
      this.checkScreenSize();
    };
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.isLoggedIn$ = this.store.select(selectIsLoggedIn);
    this.isAuthenticatedDev$ = this.store.select(selectUser).pipe(
      map((user) => (user?.role || '').toLowerCase() === ROLES.dev),
    );
  }

  ngOnInit(): void {
    this.restoreNavPreferences();
    // Subscribe to theme changes
    this.themeService.theme$.pipe(takeUntil(this.destroy$)).subscribe(theme => {
      this.currentTheme = theme;
    });
    
    // Load system settings and initialize school information observables
    const settings$ = this.systemSettingsService.getSettings().pipe(
      catchError(error => {
        console.warn('System settings unavailable, using defaults.');
        // Return default settings on error
        return of({
          schoolName: 'Junior High School',
          schoolLogo: 'assets/jhs_logo.jpg',
        } as SystemSettings);
      }),
      shareReplay(1) // Cache the result to avoid multiple HTTP calls
    );
    
    // Initialize school information observables
    this.schoolName$ = settings$.pipe(
      map(settings => {
        const name = (settings.schoolName || '').toString().trim();
        // Treat literal 'null'/'undefined' from DB as empty and fall back
        if (!name || name.toLowerCase() === 'null' || name.toLowerCase() === 'undefined') {
          return 'Junior High School';
        }
        return name;
      })
    );
    
    this.schoolLogo$ = settings$.pipe(
      map(settings => {
        const logo = (settings.schoolLogo || '').toString().trim();
        // Treat literal 'null'/'undefined' from DB as empty and fall back to bundled asset
        if (!logo || logo.toLowerCase() === 'null' || logo.toLowerCase() === 'undefined') {
          return 'assets/jhs_logo.jpg';
        }
        return logo;
      })
    );
    
    this.schoolNameAbbr$ = settings$.pipe(
      map(settings => {
        const name = settings.schoolName || 'Junior High School';
        // Generate abbreviation from school name (first letters of each word)
        return name
          .split(' ')
          .map(word => word.charAt(0).toUpperCase())
          .join('')
          .substring(0, 3) || 'JHS';
      })
    );
    
    // Update page title and apply school colors
    settings$.pipe(takeUntil(this.destroy$)).subscribe(settings => {
      const schoolName = settings.schoolName || 'Junior High School';
      this.title = schoolName;
      this.titleService.setTitle(schoolName);
      
      // Apply school colors to theme
      if (settings.primaryColor || settings.accentColor || settings.warnColor) {
        this.themeService.applySchoolColors({
          primaryColor: settings.primaryColor,
          accentColor: settings.accentColor,
          warnColor: settings.warnColor,
        });
      }
    });
    
    this.store.dispatch(checkAuthStatus());

    // When user logs in, load their profile (display name in header; for parents, linked students for finance/reports)
    combineLatest([
      this.store.select(selectUser),
      this.store.select(selectUserDetails),
    ]).pipe(
      filter(([user, details]) => {
        if (!user?.id || !user.role) return false;
        if (!details) return true; // load for all roles so we have display name
        if (user.role === ROLES.parent) return !('students' in details);
        return false;
      }),
      take(1),
      takeUntil(this.destroy$)
    ).subscribe(([user]) => {
      if (user?.id && user.role) {
        this.store.dispatch(userDetailsActions.fetchUser({ id: user.id, role: user.role }));
      }
    });

    this.checkScreenSize(); // Initial screen size check

    // Subscribe to isLoggedIn$ to update isLoggedInStatus
    this.isLoggedIn$.pipe(takeUntil(this.destroy$)).subscribe((loggedIn) => {
      this.isLoggedInStatus = loggedIn;
      // Re-evaluate sidenav state and margin when login status changes
      this.checkScreenSize(); // This will ensure sidenav opens/closes based on isLoggedInStatus
      this.changeDetectorRef.detectChanges(); // Force update view to reflect margin change
    });

    // After login, route everyone to /dashboard (role-specific view is shown inside dashboard component)
    this.isLoggedIn$.pipe(
      takeUntil(this.destroy$),
      filter((loggedIn) => !!loggedIn)
    ).subscribe(() => {
      const url = this.router.url;
      if (url === '/signin' || url === '/' || url === '') {
        this.router.navigate(['/dashboard']);
      }
    });

    this.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) {
        this.role = user.role;
      }
    });

    this.roleAccess
      .getCurrentRole$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((role) => {
        this.effectiveRole = role || null;
      });

    combineLatest([
      this.isLoggedIn$,
      this.isStudent$,
      this.isParentRole$,
      this.hasLinkedChildrenProfile$,
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([loggedIn, isStudent, isParent, hasLinkedChildren]) => {
        this.isStudentOrParentNav =
          !!loggedIn && (isStudent || isParent || hasLinkedChildren);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  checkScreenSize() {
    this.isScreenSmall = this.mobileQuery.matches;

    if (this.isScreenSmall) {
      // On small screens, ensure sidenav is closed (over mode)
      this.sidenav?.close();
      this.isSidenavCollapsed = false; // Collapsed state is irrelevant for width on overlay mode
    } else {
      // On large screens, manage sidenav open/close based on login status
      if (this.isLoggedInStatus) {
        // Only open if logged in
        this.sidenav?.open();
      } else {
        this.sidenav?.close(); // Explicitly close if not logged in on large screen
      }
      this.isSidenavCollapsed = true; // Ensure it starts collapsed on large screens
    }
  }

  onSidenavOpenedChange(isOpen: boolean) {
    if (!this.isScreenSmall) {
      // Only manage isSidenavCollapsed on large screens (for side mode)
      this.isSidenavCollapsed = !isOpen;
    }
  }

  openCalendar(): void {
    // Navigate to calendar route or open calendar dialog
    this.router.navigate(['/calendar']);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardShortcut(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.isCommandPaletteOpen = true;
    }
    if (event.key === 'Escape' && this.isCommandPaletteOpen) {
      this.closeCommandPalette();
    }
  }

  openCommandPalette(): void {
    this.isCommandPaletteOpen = true;
  }

  closeCommandPalette(): void {
    this.isCommandPaletteOpen = false;
    this.searchQuery = '';
  }

  getFilteredQuickNavItems() {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.quickNavItems;
    return this.quickNavItems.filter((item) =>
      item.label.toLowerCase().includes(q)
    );
  }

  getRecentItems() {
    return this.recentNavIds
      .map((id) => this.quickNavItems.find((item) => item.id === id))
      .filter((item): item is (typeof this.quickNavItems)[number] => !!item);
  }

  getFavoriteItems() {
    return this.favoriteNavIds
      .map((id) => this.quickNavItems.find((item) => item.id === id))
      .filter((item): item is (typeof this.quickNavItems)[number] => !!item);
  }

  isFavorite(itemId: string): boolean {
    return this.favoriteNavIds.includes(itemId);
  }

  toggleFavorite(itemId: string, event?: Event): void {
    event?.stopPropagation();
    if (this.favoriteNavIds.includes(itemId)) {
      this.favoriteNavIds = this.favoriteNavIds.filter((id) => id !== itemId);
    } else {
      this.favoriteNavIds = [itemId, ...this.favoriteNavIds].slice(0, 8);
    }
    localStorage.setItem(this.favoriteStorageKey, JSON.stringify(this.favoriteNavIds));
  }

  navigateQuick(item: { id: string; route: string }): void {
    this.router.navigate([item.route]);
    this.recentNavIds = [item.id, ...this.recentNavIds.filter((id) => id !== item.id)].slice(0, 8);
    localStorage.setItem(this.recentStorageKey, JSON.stringify(this.recentNavIds));
    this.closeCommandPalette();
    if (this.isScreenSmall) {
      this.sidenav?.close();
    }
  }

  onDevViewRoleChange(role: ROLES | null): void {
    if (!role) {
      this.selectedDevViewRole = null;
      this.roleAccess.clearDevViewRole();
      return;
    }
    this.selectedDevViewRole = role;
    this.roleAccess.setDevViewRole(role);
  }

  clearDevViewRoleSelection(): void {
    this.selectedDevViewRole = null;
    this.roleAccess.clearDevViewRole();
  }

  private restoreNavPreferences(): void {
    try {
      const recents = JSON.parse(localStorage.getItem(this.recentStorageKey) || '[]');
      const favorites = JSON.parse(localStorage.getItem(this.favoriteStorageKey) || '[]');
      this.recentNavIds = Array.isArray(recents) ? recents : [];
      this.favoriteNavIds = Array.isArray(favorites) ? favorites : [];
    } catch {
      this.recentNavIds = [];
      this.favoriteNavIds = [];
    }
  }
}
