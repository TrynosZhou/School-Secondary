import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectTeachers, selectIsLoading, selectRegErrorMsg } from '../../store/registration.selectors';
import { TeachersModel } from '../../models/teachers.model';
import { Title } from '@angular/platform-browser';
import { SharedService } from 'src/app/shared.service';
import { Subject, takeUntil, filter, map, switchMap, startWith } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddEditTeacherComponent } from '../add-edit-teacher/add-edit-teacher.component';
import { deleteTeacherAction } from '../../store/registration.actions';

@Component({
  selector: 'app-teacher-view',
  templateUrl: './teacher-view.component.html',
  styleUrls: ['./teacher-view.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeacherViewComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  teacherId!: string;
  teacher: TeachersModel | undefined;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store,
    public title: Title,
    public sharedService: SharedService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.teacherId = this.route.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.setupLoadingState();
    this.loadTeacher();
  }

  private setupLoadingState(): void {
    this.store.select(selectIsLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.isLoading = loading;
        this.cdr.markForCheck();
      });

    this.store.select(selectRegErrorMsg)
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        this.errorMessage = error;
        this.cdr.markForCheck();
      });
  }

  private loadTeacher(): void {
    this.store.select(selectTeachers)
      .pipe(
        filter(teachers => teachers.length > 0),
        map(teachers => teachers.find(tr => tr.id === this.teacherId)),
        takeUntil(this.destroy$)
      )
      .subscribe(teacher => {
        if (teacher) {
          this.teacher = teacher;
          this.title.setTitle(`${teacher.title} ${teacher.name} ${teacher.surname} - Teacher Details`);
        } else {
          this.errorMessage = 'Teacher not found';
        }
        this.cdr.markForCheck();
      });
  }

  getQualificationsList(): string[] {
    return this.teacher?.qualifications || [];
  }

  goBack(): void {
    this.router.navigate(['/teachers']);
  }

  editTeacher(): void {
    if (this.teacher) {
      this.dialog.open(AddEditTeacherComponent, { 
        data: this.teacher,
        width: '600px',
        maxWidth: '90vw'
      });
    }
  }

  deleteTeacher(): void {
    if (this.teacher && confirm(`Are you sure you want to delete ${this.teacher.title} ${this.teacher.name} ${this.teacher.surname}? This action cannot be undone.`)) {
      this.store.dispatch(deleteTeacherAction({ id: this.teacher.id }));
      this.snackBar.open('Teacher deleted successfully', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
      this.goBack();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
