import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Observable, Subject, combineLatest, BehaviorSubject } from 'rxjs';
import {
  map,
  startWith,
  takeUntil,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  filter,
} from 'rxjs/operators';
import { fromEvent } from 'rxjs';
import { ClassesModel } from '../../enrolment/models/classes.model';
import { TermsModel } from '../../enrolment/models/terms.model';
import { formatTermLabel } from '../../enrolment/models/term-label.util';
import {
  fetchClasses,
  fetchTerms,
} from '../../enrolment/store/enrolment.actions';
import { MatTableDataSource } from '@angular/material/table';
import {
  selectClasses,
  selectTerms,
} from '../../enrolment/store/enrolment.selectors';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MarksModel } from '../models/marks.model';
import { SubjectsModel } from '../models/subjects.model';
import {
  fetchSubjectMarksInClass,
  fetchSubjects,
  saveMarkAction,
  saveMarkActionSuccess,
  saveMarkActionFail,
  deleteMarkActions,
} from '../store/marks.actions';
import { selectMarks, selectSubjects, isLoading } from '../store/marks.selectors';
import { Title } from '@angular/platform-browser';
import { ExamType } from '../models/examtype.enum';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AIService } from '../../ai/ai.service';
import { PendingMarksService } from '../services/pending-marks.service';
import { HttpErrorResponse } from '@angular/common/http';
// ConfirmDialogComponent will be lazy loaded

interface MarkFormGroup {
  mark: FormControl<number | null>;
  comment: FormControl<string | null>;
}

@Component({
  selector: 'app-enter-marks',
  templateUrl: './enter-marks.component.html',
  styleUrls: ['./enter-marks.component.css'],
})
export class EnterMarksComponent implements OnInit, AfterViewInit, OnDestroy {
  classes$!: Observable<ClassesModel[]>;
  terms$!: Observable<TermsModel[]>;
  subjects$!: Observable<SubjectsModel[]>;
  isLoading$!: Observable<boolean>;
  private errorMsg$!: Observable<string>;

  enrolForm!: FormGroup;
  marksFormArray: FormArray<FormGroup<MarkFormGroup>> = new FormArray<
    FormGroup<MarkFormGroup>
  >([]);
  public dataSource = new MatTableDataSource<MarksModel>();

  value = 0;
  maxValue = 0;
  savingMarks = new Set<number>(); // Track which marks are being saved

  examtype: ExamType[] = [ExamType.midterm, ExamType.endofterm];

  // AI-generated comments per student index
  commentOptions: Map<number, string[]> = new Map();
  loadingComments: Set<number> = new Set(); // Track which comments are being generated
  
  // Subject to trigger autocomplete updates when AI comments are ready
  private commentUpdates: Map<number, BehaviorSubject<string[]>> = new Map();
  
  // Track saved marks for visual feedback
  savedMarks: Set<number> = new Set();
  
  // Track last saved values to prevent duplicate saves
  private lastSavedValues: Map<number, { mark: number | null, comment: string | null }> = new Map();
  
  // Debounce timers for saving
  private saveTimers: Map<number, any> = new Map();
  
  // Track which student number corresponds to which index for save status updates
  private studentNumberToIndex: Map<string, number> = new Map();

  // Per-row save failure state (index -> user-facing message)
  failedSaveIndices = new Set<number>();
  failedSaveErrors = new Map<number, string>();
  private readonly commentTone: 'encouraging' | 'balanced' | 'firm' = 'balanced';

  // Default fallback comments
  defaultCommentOptions: string[] = [
    'Excellent effort',
    'Good work, keep it up',
    'Needs to improve concentration',
    'Struggling with concepts',
    'Showing great potential',
    'Requires more practice',
    'Completed all assignments',
    'Participates well in class',
    'Absent for key lessons',
    'Handwriting needs improvement',
    'Neat and organized work',
    'Struggling with time management',
    'Very good',
    'Good',
    'Average',
    'Below average',
    'Needs improvement',
    'Unsatisfactory',
    'Fail',
    'Absent',
    'Present',
    'Late',
    'A fair attempt, keep it up',
    'Needs to improve',
    'Pleasing effort',
    'Superb!.',
    'A good start',
    'An impressive start',
    'Excellent work. Keep up the momentum.',
    'Good work. Keep up the momentum.',
    'You are iconic girl! Keep this standard.',
    'Excellent mark, keep on focused',
    'Satisfactory performance.',
    'Keep soaring.',
    'Satisfactory work.',
    'Elating results! Keep.working.',
    'Excellent work. Continue working hard.',
    'Quite pleasing. Keep on working',
    'An impressive start',
    'Excellent mark, keep it up',
    'Quite pleasing.',
    'A fair start',
    'A fair attempt, you have the room to improve',
    'Pull up',
    'Can do better than this.',
    'Has the potential to do better than this.',
    'A marginal pass, work hard to improve the grade.',
    'Revise work covered',
    'Aim higher please',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private actions$: Actions,
    public title: Title,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private aiService: AIService,
    private cdr: ChangeDetectorRef,
    private pendingMarks: PendingMarksService
  ) {
    this.store.dispatch(fetchClasses());
    this.store.dispatch(fetchTerms());
    this.store.dispatch(fetchSubjects());

    this.dataSource.filterPredicate = this.customFilterPredicate;
  }

  customFilterPredicate = (data: MarksModel, filter: string): boolean => {
    const searchString = filter.trim().toLowerCase();

    // Explicitly extract and combine only the desired properties, handling potential null/undefined
    const studentName = data.student?.name?.toLowerCase() || '';
    const studentSurname = data.student?.surname?.toLowerCase() || '';
    const studentNumber = data.student?.studentNumber?.toLowerCase() || ''; // StudentNumber is already a string

    const combinedString = `${studentName} ${studentSurname} ${studentNumber}`;

    return combinedString.includes(searchString);
  };

  ngOnInit(): void {
    this.classes$ = this.store.select(selectClasses);
    this.terms$ = this.store.select(selectTerms);
    this.subjects$ = this.store.select(selectSubjects).pipe(
      map((subjects) => {
        const list = subjects ?? [];
        return [...list].sort((a, b) => (a.code || '').localeCompare(b.code || ''));
      })
    );
    this.isLoading$ = this.store.select(isLoading);

    this.store
      .select(selectMarks)
      .pipe(takeUntil(this.destroy$))
      .subscribe((marks) => {
        this.dataSource.data = marks;
        this.maxValue = marks.length;
        this.updateMarksFormArray(marks);
        this.updateProgressBar();
        
        // Clear save tracking when new data is loaded
        this.clearSaveTracking();

        // Rebuild student number to index mapping
        this.studentNumberToIndex.clear();
        marks.forEach((mark, index) => {
          if (mark.student?.studentNumber) {
            this.studentNumberToIndex.set(mark.student.studentNumber, index);
          }
        });
      });

    // Listen to save success actions
    this.actions$
      .pipe(
        ofType(saveMarkActionSuccess),
        takeUntil(this.destroy$)
      )
      .subscribe(({ mark }) => {
        this.pendingMarks.remove(mark);
        const studentNumber = mark.student?.studentNumber;
        if (studentNumber && this.studentNumberToIndex.has(studentNumber)) {
          const index = this.studentNumberToIndex.get(studentNumber)!;
          this.savingMarks.delete(index);
          this.failedSaveIndices.delete(index);
          this.failedSaveErrors.delete(index);
          this.savedMarks.add(index);

          // Remove saved indicator after 2 seconds
          setTimeout(() => {
            this.savedMarks.delete(index);
            this.cdr.detectChanges();
          }, 2000);

          this.cdr.detectChanges();
        }
      });

    // Listen to save fail actions
    this.actions$
      .pipe(
        ofType(saveMarkActionFail),
        takeUntil(this.destroy$)
      )
      .subscribe(({ error, mark }) => {
        const userMessage = this.getUserFriendlySaveError(error);
        const index =
          mark?.student?.studentNumber != null
            ? this.studentNumberToIndex.get(mark.student.studentNumber)
            : undefined;

        if (index !== undefined) {
          this.savingMarks.delete(index);
          this.failedSaveIndices.add(index);
          this.failedSaveErrors.set(index, userMessage);
        } else {
          this.savingMarks.clear();
        }

        if (mark) {
          this.pendingMarks.add(mark);
        }

        this.cdr.detectChanges();

        const snackRef = this.snackBar.open(
          userMessage,
          'Retry',
          { duration: 7000, panelClass: ['error-snackbar'] }
        );
        snackRef.onAction().subscribe(() => this.retryPendingMarks());
      });

    this.enrolForm = new FormGroup({
      class: new FormControl('', [Validators.required]),
      term: new FormControl('', [Validators.required]),
      subject: new FormControl('', Validators.required),
      examType: new FormControl('', Validators.required),
    });

    // On init: if we have pending marks (e.g. restored from localStorage) and network is present, try to sync
    if (typeof navigator !== 'undefined' && navigator.onLine && this.pendingMarks.getPendingCount() > 0) {
      this.retryPendingMarks();
    }

    // Auto-retry pending marks when network comes back
    fromEvent(window, 'online')
      .pipe(
        takeUntil(this.destroy$),
        filter(() => this.pendingMarks.getPendingCount() > 0)
      )
      .subscribe(() => this.retryPendingMarks());
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private updateMarksFormArray(marks: MarksModel[]): void {
    this.marksFormArray.clear();

    marks.forEach((mark) => {
      const markControl = new FormControl<number | null>(mark.mark || null, [
        Validators.required,
        Validators.min(0),
        Validators.max(100),
      ]);
      const commentControl = new FormControl<string | null>(
        mark.comment || null,
        Validators.required
      );

      const markFormGroup = new FormGroup<MarkFormGroup>({
        mark: markControl,
        comment: commentControl,
      });

      this.marksFormArray.push(markFormGroup);

      combineLatest([
        markControl.valueChanges.pipe(
          debounceTime(300),
          distinctUntilChanged()
        ),
        commentControl.valueChanges.pipe(
          debounceTime(300),
          distinctUntilChanged()
        ),
      ])
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.updateProgressBar();
        });
    });
  }

  private updateProgressBar(): void {
    let completedCount = 0;
    this.dataSource.data.forEach((markModel, index) => {
      const formGroup = this.marksFormArray.at(
        index
      ) as FormGroup<MarkFormGroup>;
      if (
        formGroup &&
        formGroup.controls.mark.valid &&
        formGroup.controls.comment.valid
      ) {
        completedCount++;
      }
    });
    this.value = completedCount;
  }

  // This method will be called from the template
  private _filterComments(value: string, comments: string[] = this.getDefaultComments()): string[] {
    const filterValue = value.toLowerCase();
    return comments.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  /**
   * Returns an Observable of filtered comment options for a specific row.
   * This method is called from the template for each autocomplete.
   */
  getFilteredCommentOptions(index: number): Observable<string[]> {
    const commentControl = this.getCommentControl(index);
    
    // Get or create the comment update subject for this index
    if (!this.commentUpdates.has(index)) {
      this.commentUpdates.set(index, new BehaviorSubject<string[]>([]));
    }
    
    const commentUpdateSubject = this.commentUpdates.get(index)!;
    
    return combineLatest([
      commentControl.valueChanges.pipe(startWith(commentControl.value || '')),
      commentUpdateSubject.asObservable()
    ]).pipe(
      map(([inputValue, availableComments]) => {
        console.log(`🔍 getFilteredCommentOptions for index ${index}:`, {
          inputValue,
          availableComments,
          isLoading: this.loadingComments.has(index),
          hasAIComments: this.commentOptions.has(index),
          aiComments: this.commentOptions.get(index)
        });
        
        // If AI comments are being generated, show loading message
        if (this.loadingComments.has(index)) {
          console.log(`⏳ Showing loading for index ${index}`);
          return ['Generating AI comments...'];
        }
        
        // If AI comments exist, use them
        if (this.commentOptions.has(index)) {
          const aiComments = this.commentOptions.get(index)!;
          const filtered = this._filterComments(inputValue || '', aiComments);
          console.log(`🤖 Using AI comments for index ${index}:`, filtered);
          return filtered;
        }
        
        // If no mark has been entered yet, show empty array (no suggestions)
        const markControl = this.getMarkControl(index);
        if (!markControl.value || markControl.value <= 0) {
          console.log(`❌ No mark entered for index ${index}`);
          return [];
        }
        
        // Only show default comments if AI generation hasn't been triggered
        // This prevents showing defaults while waiting for AI
        const defaultComments = this.getDefaultComments().slice(0, 3);
        console.log(`📝 Using default comments for index ${index}:`, defaultComments);
        return defaultComments;
      })
    );
  }

  private getUserFriendlySaveError(error: HttpErrorResponse): string {
    const isNetwork =
      error.status === 0 ||
      error.message === 'Http failure response' ||
      (typeof error.message === 'string' &&
        (error.message.toLowerCase().includes('network') ||
          error.message.toLowerCase().includes('failed to fetch')));
    if (isNetwork) {
      return 'Connection problem. Mark saved locally; will sync when back online.';
    }
    const msg =
      error.error?.message ??
      (typeof error.error === 'string' ? error.error : null) ??
      error.message ??
      'Server error';
    return `Could not save: ${msg}`;
  }

  isSaveFailed(index: number): boolean {
    return this.failedSaveIndices.has(index);
  }

  getSaveError(index: number): string | undefined {
    return this.failedSaveErrors.get(index);
  }

  getPendingCount(): number {
    return this.pendingMarks.getPendingCount();
  }

  retryPendingMarks(): void {
    const pending = this.pendingMarks.getAll();
    pending.forEach((mark) => this.store.dispatch(saveMarkAction({ mark })));
    this.cdr.detectChanges();
  }

  retrySaveForRow(markModel: MarksModel, index: number): void {
    this.failedSaveIndices.delete(index);
    this.failedSaveErrors.delete(index);
    this.saveMark(markModel, index);
    this.cdr.detectChanges();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  get classControl() {
    return this.enrolForm.get('class');
  }

  get termControl() {
    return this.enrolForm.get('term');
  }

  get subjectControl() {
    return this.enrolForm.get('subject');
  }

  get examTypeControl() {
    return this.enrolForm.get('examType');
  }

  displayedColumns = [
    'studentNumber',
    'surname',
    'name',
    'gender',
    'markComment',
    'action',
  ];

  fetchClassList() {
    if (this.enrolForm.invalid) {
      this.snackBar.open(
        'Please select Term, Exam Type, Class, and Subject to fetch data.',
        'Close',
        { duration: 3000 }
      );
      this.enrolForm.markAllAsTouched();
      return;
    }

    const name = this.classControl?.value;
    const term: TermsModel = this.termControl?.value;
    const subject: SubjectsModel = this.subjectControl?.value;

    const num = term.num;
    const year = term.year;
    const termId = term.id;
    const subjectCode = subject.code;
    const examType = this.examTypeControl?.value;

    this.store.dispatch(
      fetchSubjectMarksInClass({ name, num, year, termId, subjectCode, examType })
    );
  }

  getMarkFormGroup(index: number): FormGroup<MarkFormGroup> {
    return this.marksFormArray.at(index) as FormGroup<MarkFormGroup>;
  }

  getMarkControl(index: number): FormControl<number | null> {
    return this.getMarkFormGroup(index).get('mark') as FormControl<
      number | null
    >;
  }

  getCommentControl(index: number): FormControl<string | null> {
    return this.getMarkFormGroup(index).get('comment') as FormControl<
      string | null
    >;
  }

  saveMark(markModel: MarksModel, index: number) {
    const formGroup = this.getMarkFormGroup(index);

    if (!formGroup.valid) {
      formGroup.markAllAsTouched();
      this.snackBar.open(
        'Please fix this row: mark 0–100 and comment required.',
        'Close',
        { duration: 3000 }
      );
      console.log(
        'Invalid form group for mark:',
        formGroup.controls.mark.errors,
        formGroup.controls.comment.errors
      );
      return;
    }

    const currentMark = formGroup.value.mark;
    const currentComment = formGroup.value.comment;
    
    // Ensure we have valid values
    if (currentMark == null || currentComment == null) {
      console.log(`⚠️ Invalid values for index ${index}: mark=${currentMark}, comment=${currentComment}`);
      return;
    }
    
    // Check if values have actually changed since last save
    const lastSaved = this.lastSavedValues.get(index);
    if (lastSaved && 
        lastSaved.mark === currentMark && 
        lastSaved.comment === currentComment) {
      console.log(`⏭️ Skipping duplicate save for index ${index} - values unchanged`);
      return;
    }

    // Clear any existing save timer for this index
    if (this.saveTimers.has(index)) {
      clearTimeout(this.saveTimers.get(index));
    }

    // Debounce the save operation
    const saveTimer = setTimeout(() => {
      this.performSave(markModel, index, currentMark, currentComment);
      this.saveTimers.delete(index);
    }, 150); // 150ms debounce

    this.saveTimers.set(index, saveTimer);
  }

  private performSave(markModel: MarksModel, index: number, mark: number | null, comment: string | null) {
    // Double-check that we're not already saving this mark
    if (this.savingMarks.has(index)) {
      console.log(`⏭️ Already saving mark for index ${index}, skipping`);
      return;
    }

    // Add to saving set
    this.savingMarks.add(index);

    // Ensure we have valid values before saving
    if (mark == null || comment == null) {
      console.log(`⚠️ Cannot save - invalid values for index ${index}: mark=${mark}, comment=${comment}`);
      this.savingMarks.delete(index);
      return;
    }

    const updatedMark: MarksModel = {
      ...markModel,
      mark: mark,
      comment: comment,
      examType: this.examTypeControl?.value,
      year: this.termControl?.value.year,
      num: this.termControl?.value.num,
      termId: this.termControl?.value.id,
    };

    console.log(`💾 Saving mark for index ${index}:`, { mark, comment });

    // Store the student number to index mapping for this save
    const studentNumber = markModel.student?.studentNumber;
    if (studentNumber) {
      this.studentNumberToIndex.set(studentNumber, index);
    }

    this.store.dispatch(saveMarkAction({ mark: updatedMark }));
    
    // Store the saved values to prevent duplicates
    this.lastSavedValues.set(index, { mark, comment });

    const formGroup = this.getMarkFormGroup(index);
    formGroup.markAsPristine();
    formGroup.markAsUntouched();
    formGroup.updateValueAndValidity(); // Ensure validity is re-evaluated after state change
    
    // Note: Success/fail feedback is now handled by the action listeners in ngOnInit
  }

  isSavingMark(index: number): boolean {
    return this.savingMarks.has(index);
  }

  async deleteMark(mark: MarksModel): Promise<void> {
    if (!mark.id) {
      this.snackBar.open('Cannot delete: Mark has no ID.', 'Error', {
        duration: 3000,
      });
      return;
    }

    const { ConfirmDialogComponent } = await import('src/app/shared/confirm-dialog/confirm-dialog.component');
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Mark',
        message: `Are you sure you want to delete the mark for ${mark.student?.name} ${mark.student?.surname}?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(deleteMarkActions.deleteMark({ mark }));
        // Success/failure feedback is handled after the API responds (see marks effects)
      }
    });
  }

  trackByTerm(index: number, term: TermsModel): string {
    return `${term.num}-${term.year}`;
  }

  formatTerm(term: TermsModel): string {
    return formatTermLabel(term);
  }

  trackByClass(index: number, clas: ClassesModel): string {
    return clas.id;
  }

  trackBySubject(index: number, subject: SubjectsModel): string {
    return subject.code;
  }

  /**
   * Handle mark input blur event to generate AI comments
   */
  onMarkBlur(markModel: MarksModel, index: number) {
    const formGroup = this.getMarkFormGroup(index);
    const markValue = formGroup.get('mark')?.value;

    if (markValue !== null && markValue !== undefined && markValue >= 0) {
      // Clear existing comments if mark changed significantly
      this.clearCommentsIfMarkChanged(index, markValue);
      
      // Generate new AI comments
      this.generateCommentsForMark(markValue, index, markModel);
    } else {
      // Clear comments if mark is invalid
      this.commentOptions.delete(index);
      this.loadingComments.delete(index);
    }
  }

  /**
   * Clear existing comments if the mark has changed significantly
   */
  private clearCommentsIfMarkChanged(index: number, newMark: number) {
    if (this.commentOptions.has(index)) {
      // Clear comments to force regeneration for new mark
      this.commentOptions.delete(index);
    }
  }

  /**
   * Generate AI comments for a specific mark
   */
  private generateCommentsForMark(mark: number, index: number, markModel: MarksModel) {
    // Don't generate if already loading or if we already have comments for this mark
    if (this.loadingComments.has(index)) {
      return;
    }

    this.loadingComments.add(index);

    // Immediately trigger change detection to show loading state
    this.getCommentControl(index).updateValueAndValidity();

    // Get subject and student level from current selection
    const subject = this.subjectControl?.value?.name;
    const className = this.classControl?.value;
    const studentLevel = className?.includes('A Level') ? 'A Level' : 'O Level';

    const request = {
      mark: mark,
      maxMark: 100, // Assuming marks are out of 100
      subject: subject,
      studentLevel: studentLevel,
      studentName: `${markModel.student?.name || ''} ${markModel.student?.surname || ''}`.trim(),
      className: className,
      examType: this.examTypeControl?.value,
      tone: this.commentTone,
      average: (markModel as any).average,
      position: (markModel as any).position,
      classSize: (markModel as any).classSize
    };

    this.aiService.generateComments(request).subscribe({
      next: (comments) => {
        this.commentOptions.set(index, comments);
        this.loadingComments.delete(index);
        
        // Trigger the comment update subject to refresh autocomplete
        const commentUpdateSubject = this.commentUpdates.get(index);
        if (commentUpdateSubject) {
          commentUpdateSubject.next(comments);
        }
        
        // Force the form control to emit a value change to refresh autocomplete
        const commentControl = this.getCommentControl(index);
        const currentValue = commentControl.value || '';
        commentControl.setValue(currentValue);
        commentControl.updateValueAndValidity();
        
        // Trigger change detection
        this.cdr.detectChanges();
        
        // Try to focus and open the autocomplete after a short delay
        setTimeout(() => {
          this.openAutocompleteForIndex(index);
        }, 100);
        
        // Show success feedback
        console.log(`✅ Generated ${comments.length} AI comments for mark ${mark}:`, comments);
        console.log(`📋 Comment options now available for index ${index}:`, this.commentOptions.get(index));
      },
      error: (error) => {
        console.error('Failed to generate AI comments:', error);
        this.loadingComments.delete(index);
        
        // Use fallback comments on error
        const fallbackComments = this.getDefaultComments();
        this.commentOptions.set(index, fallbackComments);
        
        // Trigger the comment update subject to refresh autocomplete
        const commentUpdateSubject = this.commentUpdates.get(index);
        if (commentUpdateSubject) {
          commentUpdateSubject.next(fallbackComments);
        }
        
        // Force the form control to emit a value change to refresh autocomplete
        const commentControl = this.getCommentControl(index);
        const currentValue = commentControl.value || '';
        commentControl.setValue(currentValue);
        commentControl.updateValueAndValidity();
        
        // Trigger change detection
        this.cdr.detectChanges();
        
        // Try to focus and open the autocomplete after a short delay
        setTimeout(() => {
          this.openAutocompleteForIndex(index);
        }, 100);
        
        // Show user-friendly error message
        this.snackBar.open('AI comments unavailable, using default suggestions', 'Dismiss', {
          duration: 3000,
        });
      }
    });
  }

  /**
   * Check if comments are being generated for a specific student
   */
  isGeneratingComments(index: number): boolean {
    return this.loadingComments.has(index);
  }

  /**
   * Get default comments as fallback
   */
  private getDefaultComments(): string[] {
    return [
      'Excellent effort',
      'Good work, keep it up',
      'Shows potential',
      'Needs improvement',
      'Keep practicing'
    ];
  }

  /**
   * Display function for autocomplete options
   */
  displayCommentOption(option: string): string {
    return option === 'Generating AI comments...' ? '' : option;
  }

  /**
   * Handle comment input focus event
   */
  onCommentInputFocus(index: number) {
    // If we have AI comments ready, trigger the update to ensure autocomplete shows them
    if (this.commentOptions.has(index) && !this.loadingComments.has(index)) {
      const commentUpdateSubject = this.commentUpdates.get(index);
      if (commentUpdateSubject) {
        const comments = this.commentOptions.get(index)!;
        commentUpdateSubject.next(comments);
      }
    }
  }

  /**
   * Check if a mark is currently being saved
   */
  isMarkSaving(index: number): boolean {
    return this.savingMarks.has(index);
  }

  /**
   * Check if a mark was recently saved (shows success indicator)
   */
  isMarkSaved(index: number): boolean {
    return this.savedMarks.has(index);
  }

  /**
   * Clear all save tracking when switching contexts (e.g., different class/subject)
   */
  private clearSaveTracking() {
    // Clear all timers
    this.saveTimers.forEach((timer) => clearTimeout(timer));
    this.saveTimers.clear();

    // Clear tracking data
    this.lastSavedValues.clear();
    this.savedMarks.clear();
    this.savingMarks.clear();
    this.studentNumberToIndex.clear();
    this.failedSaveIndices.clear();
    this.failedSaveErrors.clear();
  }

  /**
   * Programmatically open autocomplete for a specific index
   */
  private openAutocompleteForIndex(index: number) {
    try {
      // Find the comment input element for this row
      const commentInputs = document.querySelectorAll('input[formControlName="comment"]');
      const commentInput = commentInputs[index] as HTMLInputElement;
      
      if (commentInput) {
        // Focus the input first
        commentInput.focus();
        
        // Dispatch input event to trigger autocomplete
        const inputEvent = new Event('input', { bubbles: true, cancelable: true });
        commentInput.dispatchEvent(inputEvent);
        
        // Also dispatch focus event
        const focusEvent = new Event('focus', { bubbles: true, cancelable: true });
        commentInput.dispatchEvent(focusEvent);
        
        // Trigger a click to ensure autocomplete opens
        setTimeout(() => {
          commentInput.click();
        }, 50);
        
        console.log(`🎯 Attempted to open autocomplete for row ${index}`);
      } else {
        console.warn(`Could not find comment input for row ${index}`);
      }
    } catch (error) {
      console.warn('Error opening autocomplete:', error);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Clean up comment update subjects
    this.commentUpdates.forEach(subject => {
      subject.complete();
    });
    this.commentUpdates.clear();
    
    // Clean up save timers
    this.saveTimers.forEach(timer => {
      clearTimeout(timer);
    });
    this.saveTimers.clear();
    
    // Clean up tracking maps
    this.lastSavedValues.clear();
  }
}
