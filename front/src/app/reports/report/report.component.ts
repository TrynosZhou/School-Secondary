import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ReportsModel } from '../models/reports.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  downloadReportActions,
  saveHeadCommentActions,
  saveTeacherCommentActions,
} from '../store/reports.actions';

import {
  GenerateRoleCommentModel,
  HeadCommentModel,
  TeacherCommentModel,
} from '../models/comment.model';
import { selectUser } from 'src/app/auth/store/auth.selectors';

import { selectIsLoading, selectReports } from '../store/reports.selectors';
import { ExamType } from 'src/app/marks/models/examtype.enum';
import { Subscription, combineLatest } from 'rxjs';
import { map, filter, take } from 'rxjs/operators';
import { Actions, ofType } from '@ngrx/effects';
import { RoleAccessService } from 'src/app/services/role-access.service';
import { ROLES } from 'src/app/registration/models/roles.enum';
import { ReportsService } from '../services/reports.service';

// pdfMake.vfs = pdfFonts.pdfMake.vfs; // Commented out as per original

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css'],
})
export class ReportComponent implements OnInit, OnDestroy {
  private _report!: ReportsModel;
  
  @Input()
  set report(value: ReportsModel) {
    this._report = value;
    // Update form controls when report input changes
    if (this.commentForm && value?.report) {
      this.commentForm.get('comment')?.setValue(value.report.headComment || '', { emitEvent: false });
    }
    if (this.teacherCommentControl && value?.report) {
      this.teacherCommentControl.setValue(value.report.classTrComment || '', { emitEvent: false });
    }
  }
  
  get report(): ReportsModel {
    return this._report;
  }
  
  editState = false;
  teacherEditState = false;
  role = ''; // Initialize role
  isLoading$ = this.store.select(selectIsLoading);
  studentNumber = '';
  generatingTeacherComment = false;
  generatingHeadComment = false;
  teacherCommentSource: 'openai' | 'fallback' | null = null;
  headCommentSource: 'openai' | 'fallback' | null = null;
  
  // Permission-based access observables
  canDownloadReport$ = this.roleAccess.canDownloadReport$();
  canEditComment$ = this.roleAccess.canEditReportComment$();
  isStudent$ = this.roleAccess.getCurrentRole$().pipe(
    map(role => this.roleAccess.hasRole(ROLES.student, role))
  );
  
  // Combined observables for template use
  canEditCommentAndNotStudent$ = combineLatest([
    this.isStudent$,
    this.canEditComment$
  ]).pipe(
    map(([isStudent, canEdit]) => !isStudent && canEdit)
  );

  private saveSubscriptions: Subscription[] = [];

  // Check if report is saved (has an ID)
  get isReportSaved(): boolean {
    return !!this.report?.id;
  }

  // Comments can always be edited - saving a comment will create/update the report automatically
  get canEditComments(): boolean {
    return true;
  }

  get showAiSourceBadge(): boolean {
    return this.role !== ROLES.student && this.role !== ROLES.parent;
  }

  private userSubscription: Subscription | undefined; // Declare subscription

  constructor(
    private store: Store,
    private roleAccess: RoleAccessService,
    private actions$: Actions,
    private reportsService: ReportsService,
  ) {}

  commentForm!: FormGroup;
  teacherCommentControl: FormControl = new FormControl('');

  ngOnInit(): void {
    this.commentForm = new FormGroup({
      comment: new FormControl(this.report.report.headComment, [
        Validators.required,
      ]),
    });

    // initialise teacher comment control from report
    this.teacherCommentControl = new FormControl(
      this.report.report.classTrComment || '',
      []
    );
    this.studentNumber = this.report.report.studentNumber;

    this.userSubscription = this.store.select(selectUser).subscribe((user) => {
      if (user) {
        this.role = user.role;
      }
    });

    // Subscribe to store reports to keep local report in sync
    // This ensures the report ID is available after saving comments
    const currentStudentNumber = this.report?.studentNumber;
    if (currentStudentNumber) {
      this.saveSubscriptions.push(
        this.store.select(selectReports).pipe(
          map(reports => reports?.find(r => r.studentNumber === currentStudentNumber)),
          filter(report => !!report && (report.id !== this._report?.id || !this._report?.id)) // Update if ID changed or if we don't have an ID yet
        ).subscribe(updatedReport => {
          if (updatedReport && updatedReport.id) {
            // Update the local report with the updated report from store (which includes the ID)
            this._report = { ...updatedReport };
          }
        })
      );
    }

    // Also subscribe to save success actions as a backup
    this.saveSubscriptions.push(
      this.actions$.pipe(
        ofType(saveHeadCommentActions.saveHeadCommentSuccess),
        filter((action: { report: ReportsModel }) => action.report.studentNumber === this.report?.studentNumber)
      ).subscribe((action: { report: ReportsModel }) => {
        // Update the local report with the saved report (which includes the ID)
        this._report = { ...action.report };
      })
    );

    this.saveSubscriptions.push(
      this.actions$.pipe(
        ofType(saveTeacherCommentActions.saveTeacherCommentSuccess),
        filter((action: { report: ReportsModel }) => action.report.studentNumber === this.report?.studentNumber)
      ).subscribe((action: { report: ReportsModel }) => {
        // Update the local report with the saved report (which includes the ID)
        this._report = { ...action.report };
      })
    );
  }

  // Add ngOnDestroy to unsubscribe if the component might not be destroyed and recreated quickly
  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  get comment() {
    return this.commentForm.get('comment');
  }

  get teacherComment() {
    return this.teacherCommentControl;
  }

  saveComment() {
    // Note: Backend can now create new reports if they don't exist
    // So we allow saving comments even on unsaved reports
    if (this.comment?.valid) {
      // Ensure we have a valid report with all required properties
      if (!this.report || !this.report.report) {
        console.error('Cannot save head comment: Report data is incomplete', {
          hasReport: !!this.report,
          hasReportReport: !!(this.report?.report),
          report: this.report,
        });
        return;
      }

      const comm: string = this.comment.value;

      // Explicitly construct the report object with all necessary properties
      // id is optional - if missing, backend will create a new report
      const fullReport: ReportsModel = {
        ...(this.report.id && { id: this.report.id }), // Include id only if it exists
        num: this.report.num,
        year: this.report.year,
        name: this.report.name,
        studentNumber: this.report.studentNumber,
        report: {
          ...this.report.report, // Spread existing report.report properties
          headComment: comm, // Update the specific comment
        },
        examType: this.report.examType,
      };

      const comment: HeadCommentModel = {
        comment: comm,
        report: fullReport,
      };

      console.log('Saving head comment with report:', comment);

      this.store.dispatch(saveHeadCommentActions.saveHeadComment({ comment }));
      this.toggleEditState(); // Toggle state after dispatching
    }
  }

  // Save teacher / class comment directly on the report
  saveTeacherComment(event?: Event) {
    // Note: Backend can now create new reports if they don't exist
    // So we allow saving comments even on unsaved reports
    if (this.teacherComment?.valid) {
      const comm: string = this.teacherComment.value;

      // Ensure we have a valid report with all required properties
      if (!this.report || !this.report.report) {
        console.error('Cannot save teacher comment: Report data is incomplete', {
          hasReport: !!this.report,
          hasReportReport: !!(this.report?.report),
          report: this.report,
        });
        return;
      }

      const comment: TeacherCommentModel = {
        comment: comm,
        report: {
          ...(this.report.id && { id: this.report.id }), // Include id only if it exists
          num: this.report.num,
          year: this.report.year,
          name: this.report.name,
          studentNumber: this.report.studentNumber,
          examType: this.report.examType,
          report: this.report.report, // Ensure the nested report is included
        },
      };

      console.log('Saving teacher comment with report:', comment);

      // Prevent default form submission behavior
      event?.preventDefault?.();
      event?.stopPropagation?.();

      this.store.dispatch(
        saveTeacherCommentActions.saveTeacherComment({ comment })
      );
      this.toggleTeacherEditState();
    }
  }

  generateTeacherComment(): void {
    if (!this.report || !this.report.report || this.generatingTeacherComment) {
      return;
    }

    this.generatingTeacherComment = true;
    const payload: GenerateRoleCommentModel = {
      role: 'formTeacher',
      report: this.report,
    };

    this.reportsService.generateRoleComment(payload).subscribe({
      next: (response) => {
        if (response?.success && response.comment) {
          this.teacherCommentControl.setValue(response.comment);
          this.teacherEditState = true;
          this.teacherCommentSource = response.source;
        }
        this.generatingTeacherComment = false;
      },
      error: () => {
        this.generatingTeacherComment = false;
      },
    });
  }

  generateHeadComment(): void {
    if (!this.report || !this.report.report || this.generatingHeadComment) {
      return;
    }

    this.generatingHeadComment = true;
    const payload: GenerateRoleCommentModel = {
      role: 'headTeacher',
      report: this.report,
    };

    this.reportsService.generateRoleComment(payload).subscribe({
      next: (response) => {
        if (response?.success && response.comment) {
          this.commentForm.get('comment')?.setValue(response.comment);
          this.editState = true;
          this.headCommentSource = response.source;
        }
        this.generatingHeadComment = false;
      },
      error: () => {
        this.generatingHeadComment = false;
      },
    });
  }

  toggleEditState() {
    this.editState = !this.editState;
    // When toggling to edit state, ensure the form control value is updated
    // with the latest report comment, in case it was updated by another user or process.
    if (this.editState) {
      this.commentForm.get('comment')?.setValue(this.report.report.headComment);
    }
  }

  download() {
    // Check if report is saved first
    if (!this.isReportSaved) {
      console.warn('Cannot download: Report must be saved first');
      return;
    }

    const { report } = this.report; // Destructure for cleaner access
    const {
      className: name,
      termNumber: num,
      termYear: year,
      examType: examType,
      studentNumber,
    } = report;

    if (examType) {
      // Check if examType exists before dispatching
      this.store.dispatch(
        downloadReportActions.downloadReport({
          name,
          num,
          year,
          termId: this.report.termId,
          // Re-evaluate if you need `examType` if you already have it from `report.report.examType`
          // If the action expects `ExamType`, ensure 'examType' from 'report.report' is that type.
          examType: examType, // Explicit cast if necessary
          studentNumber: this.report.studentNumber, // Use this.report.studentNumber from the top level
        })
      );
    } else {
      console.warn('Cannot download report: ExamType is missing.');
    }
  }

  toggleTeacherEditState() {
    this.teacherEditState = !this.teacherEditState;
    if (this.teacherEditState) {
      this.teacherCommentControl.setValue(
        this.report.report.classTrComment || ''
      );
    }
  }
}
