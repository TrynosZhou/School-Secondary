import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  selectUserDetails,
  isLoading,
  selectErrorMsg,
} from '../store/auth.selectors';
import { selectAuthUserId, selectAuthUserRole } from '../store/auth.selectors';
import { userDetailsActions } from '../store/auth.actions';
import { filter, withLatestFrom, take } from 'rxjs/operators';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { TeachersModel } from 'src/app/registration/models/teachers.model';
import { ParentsModel } from 'src/app/registration/models/parents.model';
import { Observable } from 'rxjs';
import { ROLES } from 'src/app/registration/models/roles.enum';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  // Use new selectors to get ID and role
  private userId$ = this.store.select(selectAuthUserId);
  private userRole$ = this.store.select(selectAuthUserRole);

  userDetails$: Observable<
    TeachersModel | StudentsModel | ParentsModel | null
  > = this.store.select(selectUserDetails);
  isLoading$: Observable<boolean> = this.store.select(isLoading);
  errorMsg$: Observable<string> = this.store.select(selectErrorMsg);
  teacher!: TeachersModel;
  student!: StudentsModel;
  parent!: ParentsModel;
  currentUserRole: ROLES | null = null;

  constructor(private router: Router, private store: Store) {}

  ngOnInit(): void {
    this.userId$
      .pipe(
        filter((id): id is string => !!id), // Only proceed if a valid ID exists
        withLatestFrom(this.userRole$), // Get the latest role from its selector
        take(1) // Take only the first emission to prevent re-dispatching
      )
      .subscribe(([id, role]) => {
        if (id && role) {
          // Store the role for the helper functions
          this.currentUserRole = role;

          // Dispatch the new action that includes the role
          this.store.dispatch(userDetailsActions.fetchUser({ id, role }));
        }
      });

    this.userDetails$.subscribe((details) => {
      if (this.currentUserRole === ROLES.teacher || this.currentUserRole === ROLES.dev) {
        this.teacher = details as TeachersModel;
      } else if (this.currentUserRole === ROLES.student) {
        this.student = details as StudentsModel;
      } else if (this.currentUserRole === ROLES.parent) {
        this.parent = details as ParentsModel;
      }
    });
  }

  // Helper functions remain the same as they now rely on currentUserRole
  isTeacher(): boolean {
    return this.currentUserRole === ROLES.teacher || this.currentUserRole === ROLES.dev;
  }

  isStudent(): boolean {
    return this.currentUserRole === ROLES.student;
  }

  isParent(): boolean {
    return this.currentUserRole === ROLES.parent;
  }
}
