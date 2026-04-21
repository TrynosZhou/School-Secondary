import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  selectUser,
  selectIsParent,
  selectLinkedChildrenAnyRole,
} from '../auth/store/auth.selectors';

/**
 * Shared logic for "effective student number" in parent/student views:
 * - Student: current user's id (student number).
 * - Parent: selected linked child's student number (or first child if none selected).
 * Use in Reports and Finance dashboard to avoid duplicating the same logic.
 */
@Injectable({ providedIn: 'root' })
export class EffectiveStudentService {
  constructor(private store: Store) {}

  /**
   * Returns an observable of the effective student number for the current user:
   * - If override$ is set and emits a value, that value is used when non-null.
   * - Else if not parent: user.id (student number).
   * - Else if parent: the selected child's student number, or the first linked child if none selected.
   * @param selectedChildStudentNumber$ Observable of the currently selected child's student number (for parent view).
   * @param override$ Optional: when set, effective number is this value when non-null (e.g. parent tab passing child number).
   */
  getEffectiveStudentNumber$(
    selectedChildStudentNumber$: Observable<string | null>,
    override$?: Observable<string | null>,
  ): Observable<string | null> {
    const base$ = combineLatest([
      this.store.select(selectUser),
      this.store.select(selectIsParent),
      this.store.select(selectLinkedChildrenAnyRole),
      selectedChildStudentNumber$,
    ]).pipe(
      map(([user, isParent, children, selected]) => {
        if (!user?.id) return null;
        if (!isParent) return user.id;
        if (!children?.length) return null;
        return selected ?? children[0]?.studentNumber ?? null;
      }),
    );
    if (!override$) return base$;
    return combineLatest([override$, base$]).pipe(
      map(([override, base]) => (override != null && override !== '') ? override : base),
    );
  }
}
