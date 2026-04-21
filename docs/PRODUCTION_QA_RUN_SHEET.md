# Production QA Run Sheet

## Device UX Checklist

| ID | Area | Scenario | Steps | Expected Result | Status (Pass/Fail) | Owner | Date | Notes |
|---|---|---|---|---|---|---|---|---|
| UX-01 | Mobile Nav | Bottom nav visibility (student) | Login as student on mobile width (`360x800`) | Bottom nav visible with Home/Finance/Reports/Messages/More |  |  |  |  |
| UX-02 | Mobile Nav | Bottom nav visibility (parent) | Login as parent on mobile width | Bottom nav visible |  |  |  |  |
| UX-03 | Mobile Nav | Bottom nav hidden (admin/staff) | Login as admin/teacher on mobile | Bottom nav not shown for non-student/parent flows |  |  |  |  |
| UX-04 | Side Menu | Open full menu from `More` | Tap `More` on mobile bottom nav | Sidenav opens reliably |  |  |  |  |
| UX-05 | Search Launcher | Open launcher button | Tap search icon in toolbar | Command palette opens |  |  |  |  |
| UX-06 | Search Launcher | Keyboard shortcut | Press `Ctrl+K` (`Cmd+K` on Mac) | Command palette opens |  |  |  |  |
| UX-07 | Search Launcher | Close behavior | Press `Esc` and tap backdrop | Palette closes and query resets |  |  |  |  |
| UX-08 | Search Launcher | Destination search | Search `finance`, `report`, `message` | Matching destinations shown and navigable |  |  |  |  |
| UX-09 | Search Launcher | Favorites | Star/unstar destination | Favorite persists across refresh |  |  |  |  |
| UX-10 | Search Launcher | Recents | Open multiple destinations | Recents list updates and persists |  |  |  |  |
| UX-11 | Student Dashboard | Quick actions | Open student dashboard and tap Finance/Reports/Messages cards | Each card routes correctly |  |  |  |  |
| UX-12 | Parent Dashboard | Quick actions | Open parent dashboard and tap Finance/Reports/Messages cards | Each card routes correctly |  |  |  |  |
| UX-13 | Responsive | Phone layout | Test at `390x844` | No clipped UI/touch overlaps |  |  |  |  |
| UX-14 | Responsive | Tablet layout | Test at `768x1024` | Nav and cards render correctly |  |  |  |  |
| UX-15 | Responsive | Desktop layout | Test at `1366x768` | Existing desktop nav behavior unaffected |  |  |  |  |

## Route and Auth Smoke Test Matrix

| ID | Area | Scenario | Steps | Expected Result | Status (Pass/Fail) | Owner | Date | Notes |
|---|---|---|---|---|---|---|---|---|
| AUTH-01 | Session | Valid token | Login and navigate protected routes | Access works, no unexpected redirects |  |  |  |  |
| AUTH-02 | Session | Expired token | Use expired token then navigate | Redirect to `/signin` |  |  |  |  |
| AUTH-03 | Routing Guard | Unauthenticated protected route | Access `/dashboard` while logged out | Redirect to `/signin` |  |  |  |  |
| AUTH-04 | Routing Guard | Unauthorized role route | Login with restricted role, open `/system/roles` | Redirect to `/dashboard` |  |  |  |  |
| AUTH-05 | Routing Guard | Authorized role route | Login as admin, open `/system/roles` | Route opens successfully |  |  |  |  |
| AUTH-06 | Permission Check | Missing permission with allowed role | Use user lacking required permission, open protected route | Redirect to `/dashboard` |  |  |  |  |
| RT-01 | Smoke Route | `/signin` | Open route directly | Loads normally |  |  |  |  |
| RT-02 | Smoke Route | `/signup` | Open route directly | Loads with expected role options |  |  |  |  |
| RT-03 | Smoke Route | `/dashboard` | Open after login | Loads by role context |  |  |  |  |
| RT-04 | Smoke Route | `/student-financials` | Open as student/parent-linked user | Loads finance overview |  |  |  |  |
| RT-05 | Smoke Route | `/reports` | Open as allowed user | Reports screen loads |  |  |  |  |
| RT-06 | Smoke Route | `/messaging` | Open as allowed user | Messaging screen loads |  |  |  |  |
| RT-07 | Protected Route | `/user-management` | Open as non-admin | Denied/redirected |  |  |  |  |
| RT-08 | Protected Route | `/system/settings` | Open as non-admin | Denied/redirected |  |  |  |  |
| RT-09 | Protected Route | `/fees` | Open as unauthorized user | Denied/redirected |  |  |  |  |
| RT-10 | Protected Route | `/payments` | Open as unauthorized user | Denied/redirected |  |  |  |  |

## Backend Endpoint Authorization Checks

| ID | Area | Scenario | Steps | Expected Result | Status (Pass/Fail) | Owner | Date | Notes |
|---|---|---|---|---|---|---|---|---|
| API-01 | Backend Authz | `GET /auth/accounts/all` (admin) | Call with admin token | 200 OK |  |  |  |  |
| API-02 | Backend Authz | `GET /auth/accounts/all` (non-admin) | Call with non-admin token | 403 Forbidden |  |  |  |  |
| API-03 | Backend Authz | `POST /auth/:id/reset-password` (admin) | Call with admin token | Allowed |  |  |  |  |
| API-04 | Backend Authz | `POST /auth/:id/reset-password` (non-admin) | Call with non-admin token | 403 Forbidden |  |  |  |  |
| API-05 | Backend Authz | `GET /system/roles-permissions/user/:accountId/permissions` (self) | Call for own account | Allowed |  |  |  |  |
| API-06 | Backend Authz | Same endpoint (other account, non-privileged) | Call for another account | 403 Forbidden |  |  |  |  |
| API-07 | Backend Authz | Same endpoint (other account, admin) | Call for another account | Allowed |  |  |  |  |
| API-08 | Backend Authz | `GET /finance/fees` with permission | Allowed user token | 200 OK |  |  |  |  |
| API-09 | Backend Authz | `GET /finance/fees` without permission | Unauthorized token | 403 Forbidden |  |  |  |  |

## CI and Operational Checks

| ID | Area | Scenario | Steps | Expected Result | Status (Pass/Fail) | Owner | Date | Notes |
|---|---|---|---|---|---|---|---|---|
| OPS-01 | CI | Front workflow | Trigger PR/branch build | Typecheck/build/tests pass |  |  |  |  |
| OPS-02 | CI | Server workflow | Trigger PR/branch build | Lint/typecheck/build/tests pass |  |  |  |  |
| OPS-03 | Logs | Sensitive logging | Exercise login/logout/deny flows | No token/password leakage in logs |  |  |  |  |
| OPS-04 | Swagger | Production gating | Start in production-like env | Swagger disabled unless explicitly enabled |  |  |  |  |

## Rollback Drill Checklist

| Drill ID | Trigger Condition | Action | Expected Result | Status | Owner | Date | Notes |
|---|---|---|---|---|---|---|---|
| RB-01 | Major auth/navigation regression | Revert `front` commit `ce2fec9` | Front restored to prior behavior |  |  |  |  |
| RB-02 | Backend authz regression | Revert `server` commit `c292d6a` | API access restored to prior baseline |  |  |  |  |
| RB-03 | Submodule sync required | Update parent repo submodule pointers | Parent repo reflects rollback SHAs |  |  |  |  |
| RB-04 | Post-rollback validation | Re-run core smoke routes + auth checks | Service stable and usable |  |  |  |  |

## Sign-off

- QA Lead Sign-off: _____________________
- Engineering Sign-off: __________________
- Product Sign-off: ______________________
- Release Decision: Go / No-Go
- Release Date/Time: _____________________
