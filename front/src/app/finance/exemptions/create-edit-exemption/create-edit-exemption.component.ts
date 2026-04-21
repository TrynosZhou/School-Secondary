import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { ExemptionType } from '../../enums/exemption-type.enum';
import { ExemptionModel } from '../../models/exemption.model';
import { ExemptionService } from '../../services/exemption.service';
import { ThemeService, Theme } from 'src/app/services/theme.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-create-edit-exemption',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    SharedModule,
  ],
  templateUrl: './create-edit-exemption.component.html',
  styleUrls: ['./create-edit-exemption.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateEditExemptionComponent implements OnInit, OnDestroy, OnChanges {
  @Input() exemption: ExemptionModel | null = null;
  @Input() student: StudentsModel | null = null;
  @Output() saved = new EventEmitter<ExemptionModel>();
  @Output() cancelled = new EventEmitter<void>();

  exemptionForm!: FormGroup;
  exemptionTypes = Object.values(ExemptionType);
  selectedStudent: StudentsModel | null = null;
  isSubmitting = false;
  isEditMode = false;
  currentTheme: Theme = 'light';
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private exemptionService: ExemptionService,
    public themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Subscribe to theme changes
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe((theme) => {
        this.currentTheme = theme;
        this.cdr.markForCheck();
      });

    // Subscribe to changes in the exemption type to conditionally validate amounts
    this.exemptionForm
      .get('type')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((type: ExemptionType) => {
        this.toggleAmountValidators(type);
      });

    // If student is provided as input, set it
    if (this.student && this.exemptionForm) {
      this.selectedStudent = this.student;
      this.updateStudentInForm(this.student);
    }

    // If exemption is provided, populate form
    if (this.exemption && this.exemptionForm) {
      this.isEditMode = true;
      this.populateForm(this.exemption);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['exemption'] && this.exemption && this.exemptionForm) {
      this.isEditMode = true;
      this.populateForm(this.exemption);
      this.cdr.markForCheck();
    }

    if (changes['student'] && this.student && !this.selectedStudent && this.exemptionForm) {
      this.selectedStudent = this.student;
      this.updateStudentInForm(this.student);
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.exemptionForm = this.fb.group({
      studentId: [null, Validators.required],
      studentName: [{ value: '', disabled: true }],
      type: [ExemptionType.FIXED_AMOUNT, Validators.required],
      fixedAmount: [null],
      percentageAmount: [null],
      description: [''],
      isActive: [true],
    });

    // Initialize validators based on default type
    this.toggleAmountValidators(this.exemptionForm.get('type')?.value);
  }

  private populateForm(exemption: ExemptionModel): void {
    if (!this.exemptionForm) {
      return;
    }

    if (exemption.student) {
      this.selectedStudent = exemption.student;
    }

    this.exemptionForm.patchValue({
      studentId: exemption.student?.studentNumber || null,
      studentName: exemption.student 
        ? `${exemption.student.surname} ${exemption.student.name} (${exemption.student.studentNumber})`
        : '',
      type: exemption.type,
      fixedAmount: exemption.fixedAmount || null,
      percentageAmount: exemption.percentageAmount || null,
      description: exemption.description || '',
      isActive: exemption.isActive !== undefined ? exemption.isActive : true,
    });

    this.toggleAmountValidators(exemption.type);
    this.cdr.markForCheck();
  }

  private toggleAmountValidators(type: ExemptionType): void {
    const fixedAmountControl = this.exemptionForm.get('fixedAmount');
    const percentageAmountControl = this.exemptionForm.get('percentageAmount');

    if (type === ExemptionType.FIXED_AMOUNT || type === ExemptionType.STAFF_SIBLING) {
      if (type === ExemptionType.FIXED_AMOUNT) {
        fixedAmountControl?.enable();
        fixedAmountControl?.setValidators([
          Validators.required,
          Validators.min(0.01),
        ]);
      } else {
        fixedAmountControl?.clearValidators();
        fixedAmountControl?.disable();
      }
      percentageAmountControl?.clearValidators();
      percentageAmountControl?.disable();
    } else if (type === ExemptionType.PERCENTAGE) {
      percentageAmountControl?.enable();
      percentageAmountControl?.setValidators([
        Validators.required,
        Validators.min(0.01),
        Validators.max(100),
      ]);
      fixedAmountControl?.clearValidators();
      fixedAmountControl?.disable();
    }

    fixedAmountControl?.updateValueAndValidity();
    percentageAmountControl?.updateValueAndValidity();
  }

  studentSelected(student: StudentsModel): void {
    this.selectedStudent = student;
    this.updateStudentInForm(student);
  }

  private updateStudentInForm(student: StudentsModel): void {
    if (!this.exemptionForm) {
      return;
    }
    
    const studentNameControl = this.exemptionForm.get('studentName');
    const studentIdControl = this.exemptionForm.get('studentId');
    
    if (studentNameControl && studentIdControl) {
      this.exemptionForm.patchValue({
        studentId: student.studentNumber,
        studentName: `${student.surname} ${student.name} (${student.studentNumber})`,
      });
      this.cdr.markForCheck();
    }
  }

  onSubmit(): void {
    if (this.exemptionForm.valid && this.selectedStudent) {
      this.isSubmitting = true;
      this.cdr.markForCheck();

      const formValue = this.exemptionForm.value;

      if (this.isEditMode && this.exemption?.id) {
        // Update existing exemption
        this.exemptionService.updateExemption(this.exemption.id, {
          type: formValue.type,
          fixedAmount: formValue.fixedAmount,
          percentageAmount: formValue.percentageAmount,
          description: formValue.description,
          isActive: formValue.isActive,
        })
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (updatedExemption) => {
              this.isSubmitting = false;
              this.saved.emit(updatedExemption);
              this.cdr.markForCheck();
            },
            error: (error) => {
              console.error('Error updating exemption:', error);
              this.isSubmitting = false;
              this.cdr.markForCheck();
            }
          });
      } else {
        // Create new exemption
        const newExemption: ExemptionModel = {
          id: 0,
          student: this.selectedStudent,
          type: formValue.type,
          fixedAmount: formValue.fixedAmount,
          percentageAmount: formValue.percentageAmount,
          description: formValue.description,
          isActive: formValue.isActive,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        this.exemptionService.createExemption(newExemption)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (createdExemption) => {
              this.isSubmitting = false;
              this.saved.emit(createdExemption);
              this.resetForm();
              this.cdr.markForCheck();
            },
            error: (error) => {
              console.error('Error creating exemption:', error);
              this.isSubmitting = false;
              this.cdr.markForCheck();
            }
          });
      }
    } else {
      this.exemptionForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.cancelled.emit();
    this.resetForm();
  }

  private resetForm(): void {
    this.exemptionForm.reset({
      type: ExemptionType.FIXED_AMOUNT,
      isActive: true,
    });
    this.selectedStudent = null;
    this.exemptionForm.get('studentName')?.setValue('');
    this.isEditMode = false;
    this.cdr.markForCheck();
  }
}

