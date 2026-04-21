import { Component, Inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { FeesModel } from '../../models/fees.model';
import { feesActions } from '../../store/finance.actions';
import { Title } from '@angular/platform-browser';
import { SharedService } from 'src/app/shared.service';
import { FeesNames } from '../../enums/fees-names.enum';
import { Observable, Subject, takeUntil } from 'rxjs';
import { selectErrorMsg, selectIsLoading } from '../../store/finance.selector';
import { ErrorStateMatcher } from '@angular/material/core';
import { ThemeService, Theme } from '../../../services/theme.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-add-edit-fees',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './add-edit-fees.component.html',
  styleUrls: ['./add-edit-fees.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditFeesComponent implements OnInit, OnDestroy {
  feesForm!: FormGroup;
  feesNames = [...Object.values(FeesNames)];
  isLoading$ = this.store.select(selectIsLoading);
  errorMsg$ = this.store.select(selectErrorMsg);
  
  errorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control: AbstractControl | null) => {
      return !!(control && control.invalid && (control.dirty || control.touched));
    }
  };

  private destroy$ = new Subject<void>();
  currentTheme: Theme = 'light';

  constructor(
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'add' | 'edit', fee?: FeesModel },
    public title: Title,
    public sharedService: SharedService,
    private dialogRef: MatDialogRef<AddEditFeesComponent>,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeService.theme$.pipe(takeUntil(this.destroy$)).subscribe(theme => {
      this.currentTheme = theme;
    });

    this.initializeForm();
    this.setupSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.feesForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      amount: new FormControl('', [
        Validators.required,
        Validators.min(0.01),
        Validators.pattern(/^\d+(\.\d{1,2})?$/)
      ]),
      description: new FormControl('', [
        Validators.maxLength(500)
      ])
    });

    // Populate form if editing
    if (this.data?.mode === 'edit' && this.data?.fee) {
      this.feesForm.patchValue({
        name: this.data.fee.name,
        amount: this.data.fee.amount.toString(),
        description: this.data.fee.description || ''
      });
    }
  }

  private setupSubscriptions(): void {
    // No auto-close logic needed - dialog will close only on form submission success
  }

  // Form control getters
  get name() {
    return this.feesForm.get('name');
  }

  get amount() {
    return this.feesForm.get('amount');
  }

  get description() {
    return this.feesForm.get('description');
  }

  // Fee display methods
  getFeeDisplayName(feeName: FeesNames): string {
    const displayNames: { [key in FeesNames]: string } = {
      [FeesNames.oLevelApplicationFee]: 'O Level Application Fee',
      [FeesNames.aLevelApplicationFee]: 'A Level Application Fee',
      [FeesNames.deskFee]: 'Desk Fee',
      [FeesNames.oLevelTuitionDay]: 'O Level Day Tuition',
      [FeesNames.aLevelTuitionDay]: 'A Level Day Tuition',
      [FeesNames.oLevelTuitionBoarder]: 'O Level Boarder Tuition',
      [FeesNames.aLevelTuitionBoarder]: 'A Level Boarder Tuition',
      [FeesNames.oLevelScienceFee]: 'O Level Science Fee',
      [FeesNames.alevelScienceFee]: 'A Level Science Fee',
      [FeesNames.developmentFee]: 'Development Fee',
      [FeesNames.foodFee]: 'Food Fee',
      [FeesNames.transportFee]: 'Transport Fee',
      [FeesNames.vacationTuitionDay]: 'Vacation Day Tuition',
      [FeesNames.vacationTuitionBoarder]: 'Vacation Boarder Tuition',
      [FeesNames.groomingFee]: 'Grooming Fee',
      [FeesNames.brokenFurnitureFee]: 'Broken Furniture Fee',
      [FeesNames.lostBooksFee]: 'Lost Books Fee',
      [FeesNames.miscellaneousCharge]: 'Miscellaneous Charge'
    };
    return displayNames[feeName] || feeName;
  }

  getFeeCategory(feeName: FeesNames): string {
    const categories: { [key in FeesNames]: string } = {
      [FeesNames.oLevelApplicationFee]: 'New Student Fees',
      [FeesNames.aLevelApplicationFee]: 'New Student Fees',
      [FeesNames.deskFee]: 'New Student Fees',
      [FeesNames.oLevelTuitionDay]: 'O Level Fees',
      [FeesNames.aLevelTuitionDay]: 'A Level Fees',
      [FeesNames.oLevelTuitionBoarder]: 'O Level Fees',
      [FeesNames.aLevelTuitionBoarder]: 'A Level Fees',
      [FeesNames.oLevelScienceFee]: 'O Level Fees',
      [FeesNames.alevelScienceFee]: 'A Level Fees',
      [FeesNames.developmentFee]: 'O Level Fees',
      [FeesNames.foodFee]: 'Optional Services',
      [FeesNames.transportFee]: 'Optional Services',
      [FeesNames.vacationTuitionDay]: 'Vacation Fees',
      [FeesNames.vacationTuitionBoarder]: 'Vacation Fees',
      [FeesNames.groomingFee]: 'Miscellaneous Charges',
      [FeesNames.brokenFurnitureFee]: 'Miscellaneous Charges',
      [FeesNames.lostBooksFee]: 'Miscellaneous Charges',
      [FeesNames.miscellaneousCharge]: 'Miscellaneous Charges'
    };
    return categories[feeName] || 'General';
  }

  getCategoryDescription(feeName: FeesNames): string {
    const descriptions: { [key in FeesNames]: string } = {
      [FeesNames.oLevelApplicationFee]: 'One-time application fee for new O Level students',
      [FeesNames.aLevelApplicationFee]: 'One-time application fee for new A Level students',
      [FeesNames.deskFee]: 'One-time fee for furniture/desk for new students',
      [FeesNames.oLevelTuitionDay]: 'Termly tuition fee for O Level day scholars',
      [FeesNames.aLevelTuitionDay]: 'Termly tuition fee for A Level day scholars',
      [FeesNames.oLevelTuitionBoarder]: 'Termly tuition fee for O Level boarders',
      [FeesNames.aLevelTuitionBoarder]: 'Termly tuition fee for A Level boarders',
      [FeesNames.oLevelScienceFee]: 'Science fee for O Level students',
      [FeesNames.alevelScienceFee]: 'Science fee for A Level students doing science subjects',
      [FeesNames.developmentFee]: 'Development fee for O Level students',
      [FeesNames.foodFee]: 'Optional fee for day scholars who eat at school',
      [FeesNames.transportFee]: 'Optional fee for day scholars who use school transport',
      [FeesNames.vacationTuitionDay]: 'Tuition fee used for day scholars during vacation terms',
      [FeesNames.vacationTuitionBoarder]: 'Tuition fee used for boarders during vacation terms',
      [FeesNames.groomingFee]: 'Fee for student grooming and appearance standards',
      [FeesNames.brokenFurnitureFee]: 'Fee for broken or damaged school furniture replacement',
      [FeesNames.lostBooksFee]: 'Fee for lost or damaged textbooks replacement',
      [FeesNames.miscellaneousCharge]: 'General miscellaneous charge for various incidents'
    };
    return descriptions[feeName] || 'General fee description';
  }

  getCategoryClass(feeName: FeesNames): string {
    const classes: { [key in FeesNames]: string } = {
      [FeesNames.oLevelApplicationFee]: 'new-student',
      [FeesNames.aLevelApplicationFee]: 'new-student',
      [FeesNames.deskFee]: 'new-student',
      [FeesNames.oLevelTuitionDay]: 'o-level',
      [FeesNames.aLevelTuitionDay]: 'a-level',
      [FeesNames.oLevelTuitionBoarder]: 'o-level',
      [FeesNames.aLevelTuitionBoarder]: 'a-level',
      [FeesNames.oLevelScienceFee]: 'o-level',
      [FeesNames.alevelScienceFee]: 'a-level',
      [FeesNames.developmentFee]: 'o-level',
      [FeesNames.foodFee]: 'optional',
      [FeesNames.transportFee]: 'optional',
      [FeesNames.vacationTuitionDay]: 'optional',
      [FeesNames.vacationTuitionBoarder]: 'optional',
      [FeesNames.groomingFee]: 'miscellaneous',
      [FeesNames.brokenFurnitureFee]: 'miscellaneous',
      [FeesNames.lostBooksFee]: 'miscellaneous',
      [FeesNames.miscellaneousCharge]: 'miscellaneous'
    };
    return classes[feeName] || 'general';
  }

  onSubmit(): void {
    if (this.feesForm.valid) {
      const formValue = this.feesForm.value;
      
      const fee: FeesModel = {
        amount: Number(formValue.amount),
        description: formValue.description || '',
        name: formValue.name
      };

      if (this.data?.mode === 'edit' && this.data?.fee?.id) {
        this.store.dispatch(feesActions.editFee({ 
          id: this.data.fee.id, 
          fee 
        }));
      } else {
        this.store.dispatch(feesActions.addFee({ fee }));
      }

      // Close dialog after dispatching action
      // The parent component will handle refreshing the data
      this.dialogRef.close(true);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.feesForm.controls).forEach(key => {
        this.feesForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}