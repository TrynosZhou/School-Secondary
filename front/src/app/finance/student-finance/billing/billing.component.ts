import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  billStudentActions,
  feesActions,
  isNewComerActions,
} from '../../store/finance.actions';
import { FeesModel } from '../../models/fees.model';
import {
  selectedStudentInvoice,
  selectFees,
  selectIsNewComer,
} from '../../store/finance.selector';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import { TermType } from 'src/app/enrolment/models/terms.model';
import { BillModel } from '../../models/bill.model';
import { SharedService } from 'src/app/shared.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
// ConfirmDeleteDialogComponent will be lazy loaded
import { Residence } from 'src/app/enrolment/models/residence.enum';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription, combineLatest, Subject } from 'rxjs';
import { startWith, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { ThemeService, Theme } from '../../../services/theme.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatRadioModule,
    MatCheckboxModule,
    MatDividerModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingComponent implements OnInit, OnChanges, OnDestroy {
  fees: FeesModel[] = [];
  isNewComer$ = this.store.select(selectIsNewComer);
  isScienceStudent: boolean = false;
  @Input() enrolment: EnrolsModel | undefined = undefined;
  @Input() selectedTermType: TermType | undefined;
  selectedBills: BillModel[] = []; // Bills already associated with the invoice from backend
  toBill: BillModel[] = []; // Temporary staging area for bills to be processed on save
  currentInvoice: any = null; // Store current invoice for accessing student information

  academicLevel!: 'O Level' | 'A Level'; // Tracks currently selected academic level for UI logic
  showTransportFoodOptions: boolean = false; // Controls visibility of transport/food section
  showMiscellaneousCharges: boolean = true; // Controls visibility of miscellaneous charges section
  isVacationTerm: boolean = false; // Vacation terms only allow flat tuition by residence

  academicSettingsForm!: FormGroup;
  accommodationOptions = Object.values(Residence); // Use Object.values for enum strings

  // --- Subscriptions to manage memory leaks ---
  private subscriptions: Subscription[] = [];
  private accommodationTypeTrigger$: Subject<void> = new Subject<void>();
  private destroy$ = new Subject<void>();
  currentTheme: Theme = 'light';

  // --- Properties to track currently selected exclusive fees ---
  // These help in removing the *old* fee when a new one is selected in a radio group
  private currentOLevelAccommodationFee: FeesModel | undefined;
  private currentALevelAccommodationFee: FeesModel | undefined;

  constructor(
    private store: Store,
    public sharedService: SharedService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    public themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) {
    this.store.dispatch(feesActions.fetchFees());
  }

  // --- Getters for Form Controls for cleaner access ---
  get selectedAcademicLevel(): FormControl {
    if (!this.academicSettingsForm) {
      // Initialize form if it doesn't exist yet (can happen if ngOnChanges is called before ngOnInit)
      this.initializeForm();
    }
    return this.academicSettingsForm.get(
      'selectedAcademicLevel'
    ) as FormControl;
  }
  get oLevelNewComer(): FormControl {
    if (!this.academicSettingsForm) {
      this.initializeForm();
    }
    return this.academicSettingsForm.get('oLevelNewComer') as FormControl;
  }
  get aLevelNewComer(): FormControl {
    if (!this.academicSettingsForm) {
      this.initializeForm();
    }
    return this.academicSettingsForm.get('aLevelNewComer') as FormControl;
  }
  get aLevelScienceLevy(): FormControl {
    if (!this.academicSettingsForm) {
      this.initializeForm();
    }
    return this.academicSettingsForm.get('aLevelScienceLevy') as FormControl;
  }
  get oLevelAccommodationType(): FormControl {
    if (!this.academicSettingsForm) {
      this.initializeForm();
    }
    return this.academicSettingsForm.get(
      'oLevelAccommodationType'
    ) as FormControl;
  }
  get aLevelAccommodationType(): FormControl {
    if (!this.academicSettingsForm) {
      this.initializeForm();
    }
    return this.academicSettingsForm.get(
      'aLevelAccommodationType'
    ) as FormControl;
  }
  get foodOption(): FormControl {
    if (!this.academicSettingsForm) {
      this.initializeForm();
    }
    return this.academicSettingsForm.get('foodOption') as FormControl;
  }
  get transportOption(): FormControl {
    if (!this.academicSettingsForm) {
      this.initializeForm();
    }
    return this.academicSettingsForm.get('transportOption') as FormControl;
  }

  // Miscellaneous charges getters
  get groomingFee(): FormControl {
    if (!this.academicSettingsForm) {
      this.initializeForm();
    }
    return this.academicSettingsForm.get('groomingFee') as FormControl;
  }

  get brokenFurnitureFee(): FormControl {
    if (!this.academicSettingsForm) {
      this.initializeForm();
    }
    return this.academicSettingsForm.get('brokenFurnitureFee') as FormControl;
  }

  get lostBooksFee(): FormControl {
    if (!this.academicSettingsForm) {
      this.initializeForm();
    }
    return this.academicSettingsForm.get('lostBooksFee') as FormControl;
  }

  get miscellaneousCharge(): FormControl {
    if (!this.academicSettingsForm) {
      this.initializeForm();
    }
    return this.academicSettingsForm.get('miscellaneousCharge') as FormControl;
  }

  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeService.theme$.pipe(takeUntil(this.destroy$)).subscribe(theme => {
      this.currentTheme = theme;
      this.cdr.markForCheck();
    });

    // Only initialize if not already initialized (could have been initialized by getter)
    if (!this.academicSettingsForm) {
      this.initializeForm();
    }
    this.subscribeToStoreChanges();
    this.setupFormControlListeners();
    this.cdr.markForCheck();
  }

  private initializeForm(): void {
    this.academicSettingsForm = this.fb.group({
      selectedAcademicLevel: ['O Level', Validators.required],
      oLevelNewComer: [false],
      aLevelNewComer: [false],
      aLevelScienceLevy: [false],
      oLevelAccommodationType: [null, Validators.required],
      aLevelAccommodationType: [null, Validators.required],
      foodOption: [false],
      transportOption: [false],
      // Miscellaneous charges
      groomingFee: [false],
      brokenFurnitureFee: [false],
      lostBooksFee: [false],
      miscellaneousCharge: [false],
    });
  }

  private subscribeToStoreChanges(): void {
    // Subscribe to fees from Ngrx store. This is crucial as fee IDs are needed for billing.
    this.subscriptions.push(
      this.store.select(selectFees).subscribe((fees) => {
        this.fees = fees;
        // After fees are loaded, if an enrolment is already present, attempt to populate form/toBill
        // based on selectedBills (which would have been updated by selectedStudentInvoiceSubscription).
        // This handles cases where fees load *after* the invoice.
        if (this.enrolment && this.selectedBills.length > 0) {
          this.populateFormAndToBillFromSelectedBills(this.selectedBills);
          this.cdr.markForCheck();
        }
      })
    );

    // Subscribe to selected student invoice from Ngrx store.
    // This should ideally trigger populating the form and `toBill` with existing invoice data.
    this.subscriptions.push(
      this.store.select(selectedStudentInvoice).subscribe((invoice) => {
        this.currentInvoice = invoice; // Store current invoice for student information access
        this.selectedBills =
          invoice && Array.isArray(invoice.bills) ? [...invoice.bills] : [];
        // Only populate if fees are already loaded, otherwise feesSubscription will handle it.
        if (this.fees.length > 0) {
          this.populateFormAndToBillFromSelectedBills(this.selectedBills);
        }
        this.applyVacationBillingRules();
        this.cdr.markForCheck();
      })
    );
  }

  private setupFormControlListeners(): void {
    // Dynamic Form Logic: Control O Level / A Level specific fields
    this.subscriptions.push(
      this.selectedAcademicLevel.valueChanges
        .pipe(startWith(this.selectedAcademicLevel.value)) // Emit initial value to set up controls on load
        .subscribe((level: 'O Level' | 'A Level') => {
          this.academicLevel = level;
          this.toggleAcademicLevelControls(level);
          this.resetDisabledControls(level);
          this.accommodationTypeTrigger$.next(); // Trigger the accommodation logic after academic level change
        })
    );

    // Dynamic Form Logic: Control visibility of Transport & Food based on Accommodation Type
    const combinedAccommodationObservable$ = combineLatest([
      this.oLevelAccommodationType.valueChanges.pipe(
        startWith(this.oLevelAccommodationType.value)
      ),
      this.aLevelAccommodationType.valueChanges.pipe(
        startWith(this.aLevelAccommodationType.value)
      ),
      this.selectedAcademicLevel.valueChanges.pipe(
        startWith(this.selectedAcademicLevel.value)
      ),
      this.accommodationTypeTrigger$.pipe(startWith(undefined)), // Include the trigger Subject
    ]).pipe(
      // We only care about the first three values for the logic, discard the trigger signal
      map(([oLevelAcc, aLevelAcc, academicLevel, _]) => ({
        oLevelAcc,
        aLevelAcc,
        academicLevel,
      }))
    );

    this.subscriptions.push(
      combinedAccommodationObservable$.subscribe(
        ({ oLevelAcc, aLevelAcc, academicLevel }) => {
          let shouldShow = false;
          if (academicLevel === 'O Level' && oLevelAcc === Residence.Day) {
            shouldShow = true;
          } else if (
            academicLevel === 'A Level' &&
            aLevelAcc === Residence.Day
          ) {
            shouldShow = true;
          }
          this.showTransportFoodOptions = shouldShow;
          this.toggleTransportFoodControls(shouldShow);
        }
      )
    );

    // Individual Form Control Change Listeners (Modify `toBill` locally)
    this.subscriptions.push(
      this.oLevelNewComer.valueChanges.subscribe((value) => {
        const deskFee = this.findFee('deskFee');
        const oLevelApplicationFee = this.findFee('oLevelApplicationFee');

        if (value) {
          this.addFeeToToBill(deskFee);
          this.addFeeToToBill(oLevelApplicationFee);
        } else {
          // Only remove deskFee if ALevelNewComer is also false
          if (!this.aLevelNewComer.value) {
            this.removeFeeFromToBill(deskFee);
          }
          this.removeFeeFromToBill(oLevelApplicationFee);
        }
      })
    );

    this.subscriptions.push(
      this.aLevelNewComer.valueChanges.subscribe((value) => {
        const deskFee = this.findFee('deskFee');
        const aLevelApplicationFee = this.findFee('aLevelApplicationFee');

        if (value) {
          this.addFeeToToBill(deskFee);
          this.addFeeToToBill(aLevelApplicationFee);
        } else {
          // Only remove deskFee if OLevelNewComer is also false
          if (!this.oLevelNewComer.value) {
            this.removeFeeFromToBill(deskFee);
          }
          this.removeFeeFromToBill(aLevelApplicationFee);
        }
      })
    );

    this.subscriptions.push(
      this.aLevelScienceLevy.valueChanges.subscribe((value) => {
        const alevelScienceFee = this.findFee('aLevelScienceFee');
        if (value) {
          this.addFeeToToBill(alevelScienceFee);
          // console.log('added science fee', alevelScienceFee);
        } else {
          this.removeFeeFromToBill(alevelScienceFee);
        }
      })
    );

    this.subscriptions.push(
      this.foodOption.valueChanges.subscribe((value) => {
        const foodFee = this.findFee('foodFee');
        if (value) {
          this.addFeeToToBill(foodFee);
        } else {
          this.removeFeeFromToBill(foodFee);
        }
      })
    );

    this.subscriptions.push(
      this.transportOption.valueChanges.subscribe((value) => {
        const transportFee = this.findFee('transportFee');
        if (value) {
          this.addFeeToToBill(transportFee);
        } else {
          this.removeFeeFromToBill(transportFee);
        }
      })
    );

    // Miscellaneous charges subscriptions
    this.subscriptions.push(
      this.groomingFee.valueChanges.subscribe((value) => {
        const groomingFee = this.findFee('groomingFee');
        if (value) {
          this.addFeeToToBill(groomingFee);
        } else {
          this.removeFeeFromToBill(groomingFee);
        }
      })
    );

    this.subscriptions.push(
      this.brokenFurnitureFee.valueChanges.subscribe((value) => {
        const brokenFurnitureFee = this.findFee('brokenFurnitureFee');
        if (value) {
          this.addFeeToToBill(brokenFurnitureFee);
        } else {
          this.removeFeeFromToBill(brokenFurnitureFee);
        }
      })
    );

    this.subscriptions.push(
      this.lostBooksFee.valueChanges.subscribe((value) => {
        const lostBooksFee = this.findFee('lostBooksFee');
        if (value) {
          this.addFeeToToBill(lostBooksFee);
        } else {
          this.removeFeeFromToBill(lostBooksFee);
        }
      })
    );

    this.subscriptions.push(
      this.miscellaneousCharge.valueChanges.subscribe((value) => {
        const miscellaneousCharge = this.findFee('miscellaneousCharge');
        if (value) {
          this.addFeeToToBill(miscellaneousCharge);
        } else {
          this.removeFeeFromToBill(miscellaneousCharge);
        }
      })
    );

    this.subscriptions.push(
      this.oLevelAccommodationType.valueChanges
        .pipe(distinctUntilChanged())
        .subscribe((value: Residence | null) => {
          if (this.isVacationTerm) {
            this.removeFeeFromToBill(this.findFee('vacationTuitionDay'));
            this.removeFeeFromToBill(this.findFee('vacationTuitionBoarder'));
            if (value === Residence.Day) {
              this.addFeeToToBill(this.findFee('vacationTuitionDay'));
            } else if (value === Residence.Boarder) {
              this.addFeeToToBill(this.findFee('vacationTuitionBoarder'));
            }
            return;
          }

          this.removeFeeFromToBill(this.currentOLevelAccommodationFee);
          this.currentOLevelAccommodationFee = undefined;

          let newFeeToAdd: FeesModel | undefined;
          if (value === Residence.Day) {
            newFeeToAdd = this.findFee('oLevelTuitionDay');
          } else if (value === Residence.Boarder) {
            newFeeToAdd = this.findFee('oLevelTuitionBoarder');
          }

          if (newFeeToAdd) {
            this.addFeeToToBill(newFeeToAdd);
            this.currentOLevelAccommodationFee = newFeeToAdd;
          }

          // Add O Level Science Fee if student is identified as science student AND academic level is O Level
          // This ensures the fee is only added when relevant accommodation is selected
          const oLevelScienceFee = this.findFee('oLevelScienceFee');
          if (this.academicLevel === 'O Level') {
            this.addFeeToToBill(oLevelScienceFee);
          } else {
            this.removeFeeFromToBill(oLevelScienceFee);
          }
        })
    );

    this.subscriptions.push(
      this.aLevelAccommodationType.valueChanges
        .pipe(distinctUntilChanged())
        .subscribe((value: Residence | null) => {
          if (this.isVacationTerm) {
            this.removeFeeFromToBill(this.findFee('vacationTuitionDay'));
            this.removeFeeFromToBill(this.findFee('vacationTuitionBoarder'));
            if (value === Residence.Day) {
              this.addFeeToToBill(this.findFee('vacationTuitionDay'));
            } else if (value === Residence.Boarder) {
              this.addFeeToToBill(this.findFee('vacationTuitionBoarder'));
            }
            return;
          }

          this.removeFeeFromToBill(this.currentALevelAccommodationFee);
          this.currentALevelAccommodationFee = undefined;

          let newFeeToAdd: FeesModel | undefined;
          if (value === Residence.Day) {
            newFeeToAdd = this.findFee('aLevelTuitionDay');
          } else if (value === Residence.Boarder) {
            newFeeToAdd = this.findFee('aLevelTuitionBoarder');
          }

          if (newFeeToAdd) {
            this.addFeeToToBill(newFeeToAdd);
            this.currentALevelAccommodationFee = newFeeToAdd;
          }
        })
    );
  }

  private toggleAcademicLevelControls(level: 'O Level' | 'A Level'): void {
    const controls = {
      oLevelNewComer: this.oLevelNewComer,
      oLevelAccommodationType: this.oLevelAccommodationType,
      aLevelNewComer: this.aLevelNewComer,
      aLevelScienceLevy: this.aLevelScienceLevy,
      aLevelAccommodationType: this.aLevelAccommodationType,
    };

    for (const key in controls) {
      if (controls.hasOwnProperty(key)) {
        const control = controls[key as keyof typeof controls];
        if (
          (level === 'O Level' && key.startsWith('oLevel')) ||
          (level === 'A Level' && key.startsWith('aLevel'))
        ) {
          control.enable({ emitEvent: false });
        } else {
          control.disable({ emitEvent: false });
        }
      }
    }
  }

  private toggleTransportFoodControls(enable: boolean): void {
    if (enable) {
      this.foodOption.enable({ emitEvent: false });
      this.transportOption.enable({ emitEvent: false });
    } else {
      this.foodOption.disable({ emitEvent: false });
      this.foodOption.setValue(false, { emitEvent: false });
      this.removeFeeFromToBill(this.findFee('foodFee'));

      this.transportOption.disable({ emitEvent: false });
      this.transportOption.setValue(false, { emitEvent: false });
      this.removeFeeFromToBill(this.findFee('transportFee'));
    }
  }

  private getVacationTermState(): boolean {
    if (this.selectedTermType) {
      return this.selectedTermType === 'vacation';
    }
    const invoiceTermType = this.currentInvoice?.enrol?.term?.type;
    const inputTermType = (this.enrolment as any)?.term?.type;
    return invoiceTermType === 'vacation' || inputTermType === 'vacation';
  }

  private applyVacationBillingRules(): void {
    // ngOnChanges can trigger before ngOnInit; ensure form exists before control access.
    if (!this.academicSettingsForm) {
      this.initializeForm();
    }
    if (!this.academicSettingsForm) {
      return;
    }

    const isVacation = this.getVacationTermState();
    this.isVacationTerm = isVacation;

    if (!isVacation) {
      this.showMiscellaneousCharges = true;
      this.academicSettingsForm?.get('oLevelNewComer')?.enable({ emitEvent: false });
      this.academicSettingsForm?.get('aLevelNewComer')?.enable({ emitEvent: false });
      this.academicSettingsForm?.get('aLevelScienceLevy')?.enable({ emitEvent: false });
      this.academicSettingsForm?.get('groomingFee')?.enable({ emitEvent: false });
      this.academicSettingsForm?.get('brokenFurnitureFee')?.enable({ emitEvent: false });
      this.academicSettingsForm?.get('lostBooksFee')?.enable({ emitEvent: false });
      this.academicSettingsForm?.get('miscellaneousCharge')?.enable({ emitEvent: false });
      this.accommodationTypeTrigger$.next();
      return;
    }

    this.showTransportFoodOptions = false;
    this.showMiscellaneousCharges = false;

    const controlsToReset = [
      'oLevelNewComer',
      'aLevelNewComer',
      'aLevelScienceLevy',
      'foodOption',
      'transportOption',
      'groomingFee',
      'brokenFurnitureFee',
      'lostBooksFee',
      'miscellaneousCharge',
    ];
    controlsToReset.forEach((name) => {
      const control = this.academicSettingsForm?.get(name);
      control?.setValue(false, { emitEvent: false });
      control?.disable({ emitEvent: false });
    });

    [
      'deskFee',
      'oLevelApplicationFee',
      'aLevelApplicationFee',
      'aLevelScienceFee',
      'alevelScienceFee',
      'oLevelScienceFee',
      'foodFee',
      'transportFee',
      'groomingFee',
      'brokenFurnitureFee',
      'lostBooksFee',
      'miscellaneousCharge',
      'oLevelTuitionDay',
      'oLevelTuitionBoarder',
      'aLevelTuitionDay',
      'aLevelTuitionBoarder',
    ].forEach((feeName) => this.removeFeeFromToBill(this.findFee(feeName)));

    const activeAccommodation =
      this.academicLevel === 'A Level'
        ? this.aLevelAccommodationType.value
        : this.oLevelAccommodationType.value;

    this.removeFeeFromToBill(this.findFee('vacationTuitionDay'));
    this.removeFeeFromToBill(this.findFee('vacationTuitionBoarder'));

    if (activeAccommodation === Residence.Day) {
      this.addFeeToToBill(this.findFee('vacationTuitionDay'));
    } else if (activeAccommodation === Residence.Boarder) {
      this.addFeeToToBill(this.findFee('vacationTuitionBoarder'));
    }
  }

  /**
   * This method sets the form values and initializes `toBill` when an existing invoice is loaded.
   * It also sets the `current...AccommodationFee` trackers based on the loaded state.
   */
  private populateFormAndToBillFromSelectedBills(bills: BillModel[]): void {
    if (!this.fees || this.fees.length === 0) {
      return;
    }

    // Determine academic level from enrolment name - try multiple sources
    let enrolName = '';
    if (this.enrolment?.name) {
      enrolName = this.enrolment.name;
    } else if (this.currentInvoice?.enrol?.name) {
      enrolName = this.currentInvoice.enrol.name;
    } else if (bills && bills.length > 0 && bills[0]?.enrol?.name) {
      enrolName = bills[0].enrol.name;
    }
    
    const firstChar = enrolName.charAt(0);
    let determinedLevel: 'O Level' | 'A Level' = this.academicLevel || 'O Level';
    
    if (firstChar === '5' || firstChar === '6') {
      determinedLevel = 'A Level';
    } else if (firstChar === '1' || firstChar === '2' || firstChar === '3' || firstChar === '4') {
      determinedLevel = 'O Level';
    }
    
    // Check if we have student info - if not, try to get it from bills or invoice
    const student = this.enrolment?.student || this.currentInvoice?.student || (bills && bills.length > 0 ? bills[0]?.student : null);
    if (!student) {
      return; // Can't proceed without student info
    }

    const formUpdates: { [key: string]: any } = {
      selectedAcademicLevel: determinedLevel, // Set academic level based on enrolment
    };
    const initialToBill: BillModel[] = [];
    this.academicLevel = determinedLevel;

    // Reset trackers for accommodation fees
    this.currentOLevelAccommodationFee = undefined;
    this.currentALevelAccommodationFee = undefined;

    const findFee = (namePart: string) =>
      this.fees.find((fee) => fee.name.includes(namePart));
    const findBillByFeeName = (billsArray: BillModel[], namePart: string) =>
      billsArray.find((bill) => bill.fees?.name.includes(namePart));

    const addBillToInitial = (
      bill: BillModel | undefined,
      fee: FeesModel | undefined
    ) => {
      if (!bill || !student) {
        return;
      }
      const enrol = this.enrolment || this.currentInvoice?.enrol || bill.enrol;
      if (!enrol) {
        return;
      }

      // Always prefer the fee from this.fees (fetched from backend) to ensure it has all properties including amount
      // If fee parameter is provided, use it; otherwise try to find it in this.fees by ID; fallback to bill.fees
      let resolvedFee: FeesModel | undefined = fee;
      if (!resolvedFee && bill.fees?.id) {
        resolvedFee = this.fees.find((f) => f.id === bill.fees.id);
      }
      if (!resolvedFee) {
        resolvedFee = bill.fees;
      }

      // Validate that the fee has an amount before adding the bill
      if (!resolvedFee || resolvedFee.amount === undefined) {
        console.warn('Skipping bill without fee amount', {
          billId: bill.id,
          feeId: resolvedFee?.id,
          feeName: resolvedFee?.name,
        });
        return;
      }

      initialToBill.push({
        ...bill,
        fees: resolvedFee,
        student,
        enrol,
      });
    };

    // New Comer (O Level)
    const oLevelApplicationBill = findBillByFeeName(
      bills,
      'oLevelApplicationFee'
    );
    const oLevelApplicationFee = findFee('oLevelApplicationFee');
    const deskFee = findFee('deskFee');

    if (oLevelApplicationBill) {
      formUpdates['oLevelNewComer'] = true;
      addBillToInitial(oLevelApplicationBill, oLevelApplicationFee);
      // Desk fee is only added if not already added by A-Level newcomer
      if (!findBillByFeeName(bills, 'aLevelApplicationFee')) {
        addBillToInitial(findBillByFeeName(bills, 'deskFee'), deskFee);
      }
    }

    // New Comer (A Level)
    const aLevelApplicationBill = findBillByFeeName(
      bills,
      'aLevelApplicationFee'
    );
    const aLevelApplicationFee = findFee('aLevelApplicationFee');
    if (aLevelApplicationBill) {
      formUpdates['aLevelNewComer'] = true;
      addBillToInitial(aLevelApplicationBill, aLevelApplicationFee);
      // Desk fee is only added if not already added by O-Level newcomer
      if (!findBillByFeeName(bills, 'oLevelApplicationFee')) {
        addBillToInitial(findBillByFeeName(bills, 'deskFee'), deskFee);
      }
    }

    // Science Levy (A Level)
    const aLevelScienceBill = findBillByFeeName(bills, 'alevelScienceFee');
    const aLevelScienceFee = findFee('alevelScienceFee');
    if (aLevelScienceBill) {
      formUpdates['aLevelScienceLevy'] = true;
      addBillToInitial(aLevelScienceBill, aLevelScienceFee);
    }

    // Science Levy (O Level) - NEWLY ADDED LOGIC
    const oLevelScienceBill = findBillByFeeName(bills, 'oLevelScienceFee');
    const oLevelScienceFee = findFee('oLevelScienceFee');
    if (oLevelScienceBill) {
      // Assuming you might have a checkbox or similar for O Level Science Levy
      // For now, it's tied to isScienceStudent and academic level in the accommodation logic,
      // but if there's a specific form control for it, you'd set it here.
      // Example: formUpdates['oLevelScienceLevy'] = true;
      addBillToInitial(oLevelScienceBill, oLevelScienceFee);
      // Ensure `isScienceStudent` is true if this bill exists
      this.isScienceStudent = true;
    }

    // Accommodation Type (O Level)
    const oLevelTuitionDayBill = findBillByFeeName(bills, 'oLevelTuitionDay');
    const oLevelTuitionBoarderBill = findBillByFeeName(
      bills,
      'oLevelTuitionBoarder'
    );
    const vacationDayBill = findBillByFeeName(bills, 'vacationTuitionDay');
    const vacationBoarderBill = findBillByFeeName(
      bills,
      'vacationTuitionBoarder'
    );
    const oLevelDayFee = findFee('oLevelTuitionDay');
    const oLevelBoarderFee = findFee('oLevelTuitionBoarder');
    const vacationDayFee = findFee('vacationTuitionDay');
    const vacationBoarderFee = findFee('vacationTuitionBoarder');

    if (vacationDayBill) {
      formUpdates['oLevelAccommodationType'] = Residence.Day;
      addBillToInitial(vacationDayBill, vacationDayFee);
      this.currentOLevelAccommodationFee = vacationDayFee;
    } else if (vacationBoarderBill) {
      formUpdates['oLevelAccommodationType'] = Residence.Boarder;
      addBillToInitial(vacationBoarderBill, vacationBoarderFee);
      this.currentOLevelAccommodationFee = vacationBoarderFee;
    } else if (oLevelTuitionDayBill) {
      formUpdates['oLevelAccommodationType'] = Residence.Day;
      addBillToInitial(oLevelTuitionDayBill, oLevelDayFee);
      this.currentOLevelAccommodationFee = oLevelDayFee;
    } else if (oLevelTuitionBoarderBill) {
      formUpdates['oLevelAccommodationType'] = Residence.Boarder;
      addBillToInitial(oLevelTuitionBoarderBill, oLevelBoarderFee);
      this.currentOLevelAccommodationFee = oLevelBoarderFee;
    } else {
      formUpdates['oLevelAccommodationType'] = null; // No accommodation selected
    }

    // Accommodation Type (A Level)
    const aLevelTuitionDayBill = findBillByFeeName(bills, 'aLevelTuitionDay');
    const aLevelTuitionBoarderBill = findBillByFeeName(
      bills,
      'aLevelTuitionBoarder'
    );
    const aLevelDayFee = findFee('aLevelTuitionDay');
    const aLevelBoarderFee = findFee('aLevelTuitionBoarder');

    if (vacationDayBill) {
      formUpdates['aLevelAccommodationType'] = Residence.Day;
      addBillToInitial(vacationDayBill, vacationDayFee);
      this.currentALevelAccommodationFee = vacationDayFee;
    } else if (vacationBoarderBill) {
      formUpdates['aLevelAccommodationType'] = Residence.Boarder;
      addBillToInitial(vacationBoarderBill, vacationBoarderFee);
      this.currentALevelAccommodationFee = vacationBoarderFee;
    } else if (aLevelTuitionDayBill) {
      formUpdates['aLevelAccommodationType'] = Residence.Day;
      addBillToInitial(aLevelTuitionDayBill, aLevelDayFee);
      this.currentALevelAccommodationFee = aLevelDayFee;
    } else if (aLevelTuitionBoarderBill) {
      formUpdates['aLevelAccommodationType'] = Residence.Boarder;
      addBillToInitial(aLevelTuitionBoarderBill, aLevelBoarderFee);
      this.currentALevelAccommodationFee = aLevelBoarderFee;
    } else {
      formUpdates['aLevelAccommodationType'] = null; // No accommodation selected
    }

    // Meal & Transport (checkboxes)
    const foodBill = findBillByFeeName(bills, 'foodFee');
    const foodFee = findFee('foodFee');
    if (foodBill) {
      formUpdates['foodOption'] = true;
      addBillToInitial(foodBill, foodFee);
    }
    const transportBill = findBillByFeeName(bills, 'transportFee');
    const transportFee = findFee('transportFee');
    if (transportBill) {
      formUpdates['transportOption'] = true;
      addBillToInitial(transportBill, transportFee);
    }

    // Miscellaneous charges (checkboxes)
    const groomingBill = findBillByFeeName(bills, 'groomingFee');
    const groomingFee = findFee('groomingFee');
    if (groomingBill) {
      formUpdates['groomingFee'] = true;
      addBillToInitial(groomingBill, groomingFee);
    }

    const brokenFurnitureBill = findBillByFeeName(bills, 'brokenFurnitureFee');
    const brokenFurnitureFee = findFee('brokenFurnitureFee');
    if (brokenFurnitureBill) {
      formUpdates['brokenFurnitureFee'] = true;
      addBillToInitial(brokenFurnitureBill, brokenFurnitureFee);
    }

    const lostBooksBill = findBillByFeeName(bills, 'lostBooksFee');
    const lostBooksFee = findFee('lostBooksFee');
    if (lostBooksBill) {
      formUpdates['lostBooksFee'] = true;
      addBillToInitial(lostBooksBill, lostBooksFee);
    }

    const miscellaneousBill = findBillByFeeName(bills, 'miscellaneousCharge');
    const miscellaneousFee = findFee('miscellaneousCharge');
    if (miscellaneousBill) {
      formUpdates['miscellaneousCharge'] = true;
      addBillToInitial(miscellaneousBill, miscellaneousFee);
    }

    this.academicSettingsForm.patchValue(formUpdates, { emitEvent: false });
    // Filter initialToBill to ensure unique fees (in case deskFee logic caused temporary duplicates)
    this.toBill = Array.from(
      new Set(initialToBill.map((b) => b.fees?.id)),
    )
      .filter((id): id is number => !!id)
      .map((id) => initialToBill.find((b) => b.fees?.id === id)!)
      .filter((bill) => !!bill);

    // Ensure academic level controls are properly toggled based on determined level
    this.toggleAcademicLevelControls(determinedLevel);
    this.accommodationTypeTrigger$.next();
    this.applyVacationBillingRules();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.academicSettingsForm) {
      this.initializeForm();
    }

    if (changes['selectedTermType']) {
      this.applyVacationBillingRules();
      this.cdr.markForCheck();
    }

    if (changes['enrolment']) {
      this.cdr.markForCheck();
      
      // Only proceed if we have an enrolment
      if (!this.enrolment) {
        return;
      }
      
      // Determine academic level from enrolment name (first character)
      const enrolName = this.enrolment?.name || '';
      const firstChar = enrolName.charAt(0);
      let determinedLevel: 'O Level' | 'A Level' = 'O Level';
      
      if (firstChar === '5' || firstChar === '6') {
        determinedLevel = 'A Level';
      } else if (firstChar === '1' || firstChar === '2' || firstChar === '3' || firstChar === '4') {
        determinedLevel = 'O Level';
      }
      
      // Set the academic level in the form (without emitting events to avoid triggering listeners prematurely)
      this.selectedAcademicLevel.setValue(determinedLevel, { emitEvent: false });
      this.academicLevel = determinedLevel;
      
      // Check if the enrolment name indicates a science student
      this.isScienceStudent =
        this.enrolment?.name?.toLowerCase().includes('science') ?? false;

      if (this.enrolment?.student?.studentNumber) {
        const studentNumber = this.enrolment.student.studentNumber;
        this.store.dispatch(
          isNewComerActions.checkIsNewComer({ studentNumber })
        );
      }

      // If enrolment changes AND fees/selectedBills are already available, re-populate.
      if (this.fees.length > 0 && this.selectedBills.length > 0) {
        this.populateFormAndToBillFromSelectedBills(this.selectedBills);
        this.cdr.markForCheck();
      } else if (this.fees.length > 0 && this.enrolment?.student) {
        // If fees are loaded but no selected bills for new enrolment, reset form
        // But preserve the determined academic level
        this.resetFormAndBills(determinedLevel);
        this.cdr.markForCheck();
      }
      
      // Trigger academic level controls to enable/disable based on determined level
      this.toggleAcademicLevelControls(determinedLevel);
      this.accommodationTypeTrigger$.next();
      this.applyVacationBillingRules();
      
      this.cdr.markForCheck();
    }
  }

  private resetFormAndBills(academicLevel?: 'O Level' | 'A Level'): void {
    const level = academicLevel || this.academicLevel || 'O Level';
    this.academicSettingsForm.reset(
      {
        selectedAcademicLevel: level,
        oLevelNewComer: false,
        aLevelNewComer: false,
        aLevelScienceLevy: false,
        oLevelAccommodationType: null,
        aLevelAccommodationType: null,
        foodOption: false,
        transportOption: false,
      },
      { emitEvent: false }
    );
    this.toBill = [];
    this.currentOLevelAccommodationFee = undefined;
    this.currentALevelAccommodationFee = undefined;
    this.academicLevel = level;
    this.toggleAcademicLevelControls(level);
    this.accommodationTypeTrigger$.next(); // Trigger to update UI based on reset
    this.applyVacationBillingRules();
  }

  /**
   * Resets and removes bills associated with controls that are currently disabled
   * due to academic level selection.
   * @param activeLevel The academic level ('O Level' or 'A Level') that is currently active.
   */
  private resetDisabledControls(activeLevel: 'O Level' | 'A Level'): void {
    const removeAndReset = (
      control: FormControl,
      feeNamePart: string,
      currentFeeTracker?: FeesModel | undefined
    ) => {
      if (control.value) {
        control.setValue(null, { emitEvent: false }); // Reset to null for radio or false for checkbox
      }
      this.removeFeeFromToBill(this.findFee(feeNamePart));
      if (currentFeeTracker) {
        // This is for exclusive fees like accommodation
        this.removeFeeFromToBill(currentFeeTracker);
      }
    };

    if (activeLevel === 'A Level') {
      // Reset O Level specific fields
      if (this.oLevelNewComer.value) {
        this.oLevelNewComer.setValue(false, { emitEvent: false });
        this.removeFeeFromToBill(this.findFee('oLevelApplicationFee'));
      }
      // Handle deskFee: remove if OLevelNewComer was true AND ALevelNewComer is false
      // This is crucial to avoid removing deskFee if ALevelNewComer is still true
      if (
        !this.aLevelNewComer.value &&
        this.toBill.some((b) => b.fees?.name.includes('deskFee'))
      ) {
        this.removeFeeFromToBill(this.findFee('deskFee'));
      }

      if (this.oLevelAccommodationType.value) {
        removeAndReset(
          this.oLevelAccommodationType,
          'oLevelTuitionDay',
          this.currentOLevelAccommodationFee
        );
        removeAndReset(this.oLevelAccommodationType, 'oLevelTuitionBoarder');
        this.currentOLevelAccommodationFee = undefined;
      }
      // Remove O Level Science Fee if A Level is selected, as it's an O Level specific fee
      this.removeFeeFromToBill(this.findFee('oLevelScienceFee'));
    } else if (activeLevel === 'O Level') {
      // Reset A Level specific fields
      if (this.aLevelNewComer.value) {
        this.aLevelNewComer.setValue(false, { emitEvent: false });
        this.removeFeeFromToBill(this.findFee('aLevelApplicationFee'));
      }
      // Handle deskFee: remove if ALevelNewComer was true AND OLevelNewComer is false
      if (
        !this.oLevelNewComer.value &&
        this.toBill.some((b) => b.fees?.name.includes('deskFee'))
      ) {
        this.removeFeeFromToBill(this.findFee('deskFee'));
      }

      if (this.aLevelScienceLevy.value) {
        this.aLevelScienceLevy.setValue(false, { emitEvent: false });
        this.removeFeeFromToBill(this.findFee('alevelScienceFee'));
      }

      if (this.aLevelAccommodationType.value) {
        removeAndReset(
          this.aLevelAccommodationType,
          'aLevelTuitionDay',
          this.currentALevelAccommodationFee
        );
        removeAndReset(this.aLevelAccommodationType, 'aLevelTuitionBoarder');
        this.currentALevelAccommodationFee = undefined;
      }
    }
  }

  // --- Local Bill Management Methods (ONLY modify `toBill` array) ---

  private findFee(namePart: string): FeesModel | undefined {
    return this.fees.find((fee) => fee.name.includes(namePart));
  }

  /**
   * Adds a FeesModel to the `toBill` array if it's not already present.
   * Creates a new BillModel with student and enrolment data.
   * @param fee The FeesModel to add.
   */
  addFeeToToBill(fee: FeesModel | undefined): void {
    if (!fee?.id) {
      return;
    }
    
    // Validate that fee has amount property
    if (fee.amount === undefined || fee.amount === null) {
      console.warn('Cannot add fee without amount to bill', {
        feeId: fee.id,
        feeName: fee.name,
      });
      return;
    }
    
    // Use currentInvoice.student for editing existing invoices, or enrolment.student for new invoices
    const student = this.currentInvoice?.student || this.enrolment?.student;
    const enrol = this.currentInvoice?.enrol || this.enrolment;
    
    if (!fee || !student || !enrol) {
      return;
    }

    // Check if a bill with this fee ID is already in `toBill`
    const existingBillIndex = this.toBill.findIndex(
      (b) => b.fees?.id === fee.id
    );

    if (existingBillIndex === -1) {
      const newBill: BillModel = {
        student: student,
        fees: fee,
        enrol: enrol,
      };
      this.toBill.push(newBill);
    }
  }

  /**
   * Removes a FeesModel from the `toBill` array.
   * @param fee The FeesModel to remove.
   */
  removeFeeFromToBill(fee: FeesModel | undefined): void {
    if (!fee?.id) {
      return; // Early exit if fee or fee.id is undefined
    }

    const billToRemoveIndex = this.toBill.findIndex(
      (b) => b.fees?.id === fee.id
    );
    if (billToRemoveIndex !== -1) {
      this.toBill.splice(billToRemoveIndex, 1);
    }
  }

  // --- Event Handlers for UI Buttons ---
  onSaveChanges(): void {
    if (this.academicSettingsForm.valid) {
      this.confirmBill(); // This will lead to `billStudent()` if confirmed
    } else {
      this.snackBar.open(
        'Please correct the form errors before saving.',
        'Close',
        {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'end',
        }
      );
      this.academicSettingsForm.markAllAsTouched(); // Show validation errors
    }
  }

  onCancel(): void {
    this.snackBar.open('Changes cancelled.', 'Close', {
      duration: 2000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
    });
    // Reset form and toBill to the initial state based on `selectedBills`
    this.populateFormAndToBillFromSelectedBills(this.selectedBills);
  }

  // --- Dialogs and Ngrx Dispatch ---
  billStudent(): void {
    // This action updates the selected invoice with the new bills locally
    // The user will save the invoice later using the save button
    if (!this.currentInvoice?.student) {
      this.snackBar.open(
        'Error: Student information missing for billing.',
        'Close',
        { duration: 3000 }
      );
      return;
    }

    if (this.toBill.length === 0) {
      this.snackBar.open('No bills selected to add to invoice.', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      });
      return;
    }

    this.store.dispatch(billStudentActions.billStudent({ bills: this.toBill }));

    // Show success message
    this.snackBar.open('Bills updated successfully!', 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
    });
  }

  async confirmBill(): Promise<void> {
    // Lazy load the confirm dialog component
    const { ConfirmDialogComponent } = await import('src/app/shared/confirm-dialog/confirm-dialog.component');
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        message: 'Are you sure you want to bill student with selected fees?',
        title: 'Confirm Billing',
        bills: this.toBill,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.billStudent();
      }
    });
  }

  // `isSelected` remains for UI display logic (e.g., to indicate what's already on the invoice)
  isSelected(fee: FeesModel): boolean {
    return this.selectedBills.some(
      (selectedBill) => selectedBill.fees?.id === fee.id
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.destroy$.next();
    this.destroy$.complete();
  }
}
