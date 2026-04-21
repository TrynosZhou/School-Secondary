import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromAuthReducer from '../store/auth.reducer';

export const authState = createFeatureSelector<fromAuthReducer.State>('auth');

export const selectErrorMsg = createSelector(
  authState,
  (state: fromAuthReducer.State) => state.errorMessage
);

export const selectIsLoggedIn = createSelector(
  authState,
  (state: fromAuthReducer.State) => state.isLoggedin
);

export const isLoading = createSelector(
  authState,
  (state: fromAuthReducer.State) => state.isLoading
);

export const selectAccStats = createSelector(
  authState,
  (state: fromAuthReducer.State) => state.accStats
);

export const selectUser = createSelector(
  authState,
  (state: fromAuthReducer.State) => state.user
);

export const selectAuthUserRole = createSelector(
  authState,
  (state: fromAuthReducer.State) => state.user?.role
);

export const selectAuthUserId = createSelector(
  authState,
  (state: fromAuthReducer.State) => state.user?.id
);

export const selectUserDetails = createSelector(
  authState,
  (state: fromAuthReducer.State) => state.userDetails
);

/**
 * Linked children (students) for any role that has a parent profile attached.
 * This relies on `userDetails.students` being populated, regardless of the user's primary role.
 */
export const selectLinkedChildrenAnyRole = createSelector(
  authState,
  (state: fromAuthReducer.State) => {
    const details = state.userDetails as
      | { students?: { studentNumber: string; name?: string; surname?: string }[] }
      | null
      | undefined;

    if (!details || !('students' in details)) {
      return [];
    }

    return details.students || [];
  }
);

/**
 * True when the current account has any linked children in their profile,
 * regardless of whether their primary role is parent, teacher, dev, etc.
 * Used to drive "parent-like" views for teacher/dev accounts that also
 * have a parent profile attached.
 */
export const selectHasLinkedChildrenProfile = createSelector(
  selectLinkedChildrenAnyRole,
  (children) => children.length > 0
);

/** When user is parent: list of linked child student numbers; otherwise null (no restriction). */
export const selectLinkedStudentNumbers = createSelector(
  authState,
  (state: fromAuthReducer.State) => {
    const role = state.user?.role;
    const details = state.userDetails;
    if (!role || (role as string).toLowerCase() !== 'parent' || !details || !('students' in details)) return null;
    const students = (details as { students?: { studentNumber: string }[] }).students;
    return (students || []).map((s) => s.studentNumber);
  }
);

/** When user is parent: list of linked children for dropdowns; otherwise empty array. */
export const selectLinkedChildrenForParent = createSelector(
  authState,
  (state: fromAuthReducer.State) => {
    const role = state.user?.role;
    const details = state.userDetails;
    if (!role || (role as string).toLowerCase() !== 'parent' || !details || !('students' in details)) return [];
    const students = (details as { students?: { studentNumber: string; name?: string; surname?: string }[] }).students;
    return students || [];
  }
);

export const selectIsParent = createSelector(
  selectAuthUserRole,
  (role) => (role && role.toLowerCase()) === 'parent'
);

/** Display name for header: student = name + surname, teacher/parent = title + surname, else username */
export const selectUserDisplayName = createSelector(
  authState,
  (state: fromAuthReducer.State) => {
    const user = state.user;
    const details = state.userDetails;
    const role = user?.role;
    if (!user) return null;
    if (details && role === 'student' && 'name' in details && 'surname' in details) {
      return `${(details as { name: string }).name} ${(details as { surname: string }).surname}`.trim();
    }
    if (details && (role === 'teacher' || role === 'dev') && 'title' in details && 'surname' in details) {
      const d = details as { title?: string; surname: string };
      return [d.title, d.surname].filter(Boolean).join(' ').trim() || user.username;
    }
    if (details && role === 'parent' && 'title' in details && 'surname' in details) {
      const d = details as { title?: string; surname: string };
      return [d.title, d.surname].filter(Boolean).join(' ').trim() || user.username;
    }
    return user.username || null;
  }
);
