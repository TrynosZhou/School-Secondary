import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, Observable, of } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { ThemeService, Theme } from 'src/app/services/theme.service';
import { Title } from '@angular/platform-browser';
import { EnrolmentModule } from 'src/app/enrolment/enrolment.module';
import { MarksModule } from 'src/app/marks/marks.module';
import { ReportReleaseManagementModule } from '../components/report-release-management/report-release-management.module';
import { GradingSystemService, GradingSystem, GradeThresholds } from '../services/grading-system.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-academic-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatTableModule,
    EnrolmentModule,
    MarksModule,
    ReportReleaseManagementModule,
  ],
  templateUrl: './academic-settings.component.html',
  styleUrls: ['./academic-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcademicSettingsComponent implements OnInit, OnDestroy {
  academicSettingsForm: FormGroup;
  gradingSettingsForm: FormGroup;
  currentTheme: Theme = 'light';
  selectedTab = 0;
  isLoading = false;
  
  // Grading systems data
  gradingSystems: GradingSystem[] = [];
  oLevelGrading: GradingSystem | null = null;
  aLevelGrading: GradingSystem | null = null;
  
  // Forms for grade thresholds
  oLevelForm!: FormGroup;
  aLevelForm!: FormGroup;
  
  // Table columns for grade thresholds
  displayedColumns: string[] = ['grade', 'threshold', 'description'];
  oLevelThresholdsDataSource = new MatTableDataSource<{grade: string, threshold: number, description: string}>([]);
  aLevelThresholdsDataSource = new MatTableDataSource<{grade: string, threshold: number, description: string}>([]);
  
  private destroy$ = new Subject<void>();

  // Grade scales
  gradeScales = [
    { value: 'percentage', label: 'Percentage (0-100)' },
    { value: 'letter', label: 'Letter Grades (A-F)' },
    { value: 'points', label: 'Points (0-7)' },
  ];

  // Academic levels
  academicLevels = ['O Level', 'A Level'];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private themeService: ThemeService,
    private title: Title,
    private cdr: ChangeDetectorRef,
    private gradingSystemService: GradingSystemService
  ) {
    this.academicSettingsForm = this.fb.group({
      academicYearStart: ['', Validators.required],
      academicYearEnd: ['', Validators.required],
      defaultTermCount: [3, [Validators.required, Validators.min(1), Validators.max(4)]],
      allowTermOverlap: [false],
      minimumEnrollmentAge: [13, [Validators.min(0), Validators.max(25)]],
      maximumEnrollmentAge: [20, [Validators.min(0), Validators.max(25)]],
    });

    this.gradingSettingsForm = this.fb.group({
      gradeScale: ['percentage', Validators.required],
      passingGrade: [50, [Validators.required, Validators.min(0), Validators.max(100)]],
      excellentGrade: [80, [Validators.required, Validators.min(0), Validators.max(100)]],
      showGradesToStudents: [true],
      showGradesToParents: [true],
      allowGradeOverrides: [false],
    });

    // Initialize grade threshold forms
    this.initializeGradeThresholdForms();
  }

  private initializeGradeThresholdForms(): void {
    // O Level form
    this.oLevelForm = this.fb.group({
      aStar: [90, [Validators.required, Validators.min(0), Validators.max(100)]],
      a: [70, [Validators.required, Validators.min(0), Validators.max(100)]],
      b: [60, [Validators.required, Validators.min(0), Validators.max(100)]],
      c: [50, [Validators.required, Validators.min(0), Validators.max(100)]],
      d: [40, [Validators.required, Validators.min(0), Validators.max(100)]],
      e: [35, [Validators.required, Validators.min(0), Validators.max(100)]],
      failGrade: ['U', Validators.required],
    });

    // A Level form
    this.aLevelForm = this.fb.group({
      aStar: [90, [Validators.required, Validators.min(0), Validators.max(100)]],
      a: [75, [Validators.required, Validators.min(0), Validators.max(100)]],
      b: [65, [Validators.required, Validators.min(0), Validators.max(100)]],
      c: [50, [Validators.required, Validators.min(0), Validators.max(100)]],
      d: [40, [Validators.required, Validators.min(0), Validators.max(100)]],
      e: [35, [Validators.required, Validators.min(0), Validators.max(100)]],
      failGrade: ['F', Validators.required],
    });
  }

  ngOnInit(): void {
    this.title.setTitle('Academic Settings');
    
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.currentTheme = theme;
        this.cdr.markForCheck();
      });

    this.loadSettings();
    this.loadGradingSystems();
  }

  loadGradingSystems(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.gradingSystemService.getAllGradingSystems()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading grading systems:', error);
          this.snackBar.open('Failed to load grading systems', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
          this.cdr.markForCheck();
          return of([]);
        })
      )
      .subscribe((systems: GradingSystem[]) => {
        this.gradingSystems = systems;
        
        // Find O Level and A Level systems
        this.oLevelGrading = systems.find(s => s.level === 'O Level') || null;
        this.aLevelGrading = systems.find(s => s.level === 'A Level') || null;

        // Populate forms with existing data
        if (this.oLevelGrading) {
          this.oLevelForm.patchValue({
            aStar: this.oLevelGrading.gradeThresholds.aStar,
            a: this.oLevelGrading.gradeThresholds.a,
            b: this.oLevelGrading.gradeThresholds.b,
            c: this.oLevelGrading.gradeThresholds.c,
            d: this.oLevelGrading.gradeThresholds.d,
            e: this.oLevelGrading.gradeThresholds.e,
            failGrade: this.oLevelGrading.failGrade,
          });
        }

        if (this.aLevelGrading) {
          this.aLevelForm.patchValue({
            aStar: this.aLevelGrading.gradeThresholds.aStar,
            a: this.aLevelGrading.gradeThresholds.a,
            b: this.aLevelGrading.gradeThresholds.b,
            c: this.aLevelGrading.gradeThresholds.c,
            d: this.aLevelGrading.gradeThresholds.d,
            e: this.aLevelGrading.gradeThresholds.e,
            failGrade: this.aLevelGrading.failGrade,
          });
        }

        // Update table data sources
        this.oLevelThresholdsDataSource.data = this.getGradeThresholdsData('O Level');
        this.aLevelThresholdsDataSource.data = this.getGradeThresholdsData('A Level');

        this.isLoading = false;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSettings(): void {
    // TODO: Load settings from backend
    // For now, set default values
    const currentYear = new Date().getFullYear();
    this.academicSettingsForm.patchValue({
      academicYearStart: `${currentYear}-01-01`,
      academicYearEnd: `${currentYear}-12-31`,
    });
  }

  onSaveAcademicSettings(): void {
    if (this.academicSettingsForm.invalid) {
      this.snackBar.open('Please fill in all required fields correctly', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    // TODO: Save to backend
    setTimeout(() => {
      this.isLoading = false;
      this.snackBar.open('Academic settings saved successfully', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
      this.cdr.markForCheck();
    }, 1000);
  }

  onSaveGradingSettings(): void {
    if (this.gradingSettingsForm.invalid) {
      this.snackBar.open('Please fill in all required fields correctly', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    // TODO: Save to backend
    setTimeout(() => {
      this.isLoading = false;
      this.snackBar.open('Grading settings saved successfully', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
      this.cdr.markForCheck();
    }, 1000);
  }

  onResetAcademicSettings(): void {
    if (!confirm('Are you sure you want to reset all academic settings to defaults?')) {
      return;
    }
    this.academicSettingsForm.reset();
    this.loadSettings();
  }

  onResetGradingSettings(): void {
    if (!confirm('Are you sure you want to reset all grading settings to defaults?')) {
      return;
    }
    this.gradingSettingsForm.reset({
      gradeScale: 'percentage',
      passingGrade: 50,
      excellentGrade: 80,
      showGradesToStudents: true,
      showGradesToParents: true,
      allowGradeOverrides: false,
    });
  }

  onSaveOLevelGrading(): void {
    if (this.oLevelForm.invalid) {
      this.snackBar.open('Please fill in all grade thresholds correctly', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    const formValue = this.oLevelForm.value;
    const gradeThresholds: GradeThresholds = {
      aStar: formValue.aStar,
      a: formValue.a,
      b: formValue.b,
      c: formValue.c,
      d: formValue.d,
      e: formValue.e,
    };

    const operation = this.oLevelGrading
      ? this.gradingSystemService.updateGradingSystem('O Level', gradeThresholds, formValue.failGrade)
      : this.gradingSystemService.saveGradingSystem('O Level', gradeThresholds, formValue.failGrade);

    operation
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error saving O Level grading:', error);
          this.snackBar.open('Failed to save O Level grading system', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
          this.cdr.markForCheck();
          return of(null);
        })
      )
      .subscribe((result) => {
        if (result) {
          this.snackBar.open('O Level grading system saved successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadGradingSystems(); // Reload to get updated data
          this.oLevelThresholdsDataSource.data = this.getGradeThresholdsData('O Level');
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      });
  }

  onSaveALevelGrading(): void {
    if (this.aLevelForm.invalid) {
      this.snackBar.open('Please fill in all grade thresholds correctly', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    const formValue = this.aLevelForm.value;
    const gradeThresholds: GradeThresholds = {
      aStar: formValue.aStar,
      a: formValue.a,
      b: formValue.b,
      c: formValue.c,
      d: formValue.d,
      e: formValue.e,
    };

    const operation = this.aLevelGrading
      ? this.gradingSystemService.updateGradingSystem('A Level', gradeThresholds, formValue.failGrade)
      : this.gradingSystemService.saveGradingSystem('A Level', gradeThresholds, formValue.failGrade);

    operation
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error saving A Level grading:', error);
          this.snackBar.open('Failed to save A Level grading system', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
          this.cdr.markForCheck();
          return of(null);
        })
      )
      .subscribe((result) => {
        if (result) {
          this.snackBar.open('A Level grading system saved successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadGradingSystems(); // Reload to get updated data
          this.aLevelThresholdsDataSource.data = this.getGradeThresholdsData('A Level');
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      });
  }

  getGradeThresholdsData(level: 'O Level' | 'A Level'): Array<{grade: string, threshold: number, description: string}> {
    const grading = level === 'O Level' ? this.oLevelGrading : this.aLevelGrading;
    if (!grading) return [];

    const thresholds = grading.gradeThresholds;
    return [
      { grade: 'A*', threshold: thresholds.aStar, description: 'Excellent' },
      { grade: 'A', threshold: thresholds.a, description: 'Very Good' },
      { grade: 'B', threshold: thresholds.b, description: 'Good' },
      { grade: 'C', threshold: thresholds.c, description: 'Satisfactory' },
      { grade: 'D', threshold: thresholds.d, description: 'Pass' },
      { grade: 'E', threshold: thresholds.e, description: 'Marginal Pass' },
      { grade: grading.failGrade, threshold: 0, description: 'Fail' },
    ];
  }
}

