import { ROLES } from './../../registration/models/roles.enum';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { feesActions } from '../store/finance.actions';
import { selectFees, selectIsLoading } from '../store/finance.selector';
import { FeesModel } from '../models/fees.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
// AddEditFeesComponent is dynamically loaded
import { SharedService } from 'src/app/shared.service';
import { selectUser } from 'src/app/auth/store/auth.selectors';
import { Observable, Subject, takeUntil } from 'rxjs';
import { map } from 'rxjs/operators';
import { FeesNames } from '../enums/fees-names.enum';
import { ThemeService, Theme } from '../../services/theme.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { RoleAccessService } from '../../services/role-access.service';

@Component({
  selector: 'app-fees',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
  ],
  templateUrl: './fees.component.html',
  styleUrls: ['./fees.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeesComponent implements OnInit, OnDestroy {
  fees$ = this.store.select(selectFees);
  isLoading$ = this.store.select(selectIsLoading);
  user$ = this.store.select(selectUser);
  role!: ROLES;
  canManageFees$ = this.roleAccess.canManageFees$();

  // Organized fee categories
  oLevelDayFees: FeesModel[] = [];
  oLevelBoarderFees: FeesModel[] = [];
  oLevelAdditionalFees: FeesModel[] = [];
  aLevelDayFees: FeesModel[] = [];
  aLevelBoarderFees: FeesModel[] = [];
  aLevelScienceFees: FeesModel[] = [];
  newStudentFees: FeesModel[] = [];
  optionalServiceFees: FeesModel[] = [];
  vacationFees: FeesModel[] = [];

  private destroy$ = new Subject<void>();
  currentTheme: Theme = 'light';

  constructor(
    public title: Title,
    private store: Store,
    private dialog: MatDialog,
    public sharedService: SharedService,
    public themeService: ThemeService,
    private roleAccess: RoleAccessService
  ) {
    this.store.dispatch(feesActions.fetchFees());
  }

  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeService.theme$.pipe(takeUntil(this.destroy$)).subscribe(theme => {
      this.currentTheme = theme;
    });

    this.fees$.pipe(takeUntil(this.destroy$)).subscribe((fees) => {
      this.organizeFeesByCategory(fees);
    });

    this.user$.pipe(takeUntil(this.destroy$)).subscribe((usr) => {
      if (usr?.role) this.role = usr.role;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private organizeFeesByCategory(fees: FeesModel[]): void {
    // Reset all categories
    this.oLevelDayFees = [];
    this.oLevelBoarderFees = [];
    this.oLevelAdditionalFees = [];
    this.aLevelDayFees = [];
    this.aLevelBoarderFees = [];
    this.aLevelScienceFees = [];
    this.newStudentFees = [];
    this.optionalServiceFees = [];
    this.vacationFees = [];

    fees.forEach(fee => {
      switch (fee.name) {
        // O Level Fees
        case FeesNames.oLevelTuitionDay:
          this.oLevelDayFees.push(fee);
          break;
        case FeesNames.oLevelTuitionBoarder:
          this.oLevelBoarderFees.push(fee);
          break;
        case FeesNames.oLevelScienceFee:
        case FeesNames.developmentFee:
          this.oLevelAdditionalFees.push(fee);
          break;

        // A Level Fees
        case FeesNames.aLevelTuitionDay:
          this.aLevelDayFees.push(fee);
          break;
        case FeesNames.aLevelTuitionBoarder:
          this.aLevelBoarderFees.push(fee);
          break;
        case FeesNames.alevelScienceFee:
          this.aLevelScienceFees.push(fee);
          break;

        // New Student Fees
        case FeesNames.oLevelApplicationFee:
        case FeesNames.aLevelApplicationFee:
        case FeesNames.deskFee:
          this.newStudentFees.push(fee);
          break;

        // Optional Services
        case FeesNames.foodFee:
        case FeesNames.transportFee:
          this.optionalServiceFees.push(fee);
          break;
        case FeesNames.vacationTuitionDay:
        case FeesNames.vacationTuitionBoarder:
          this.vacationFees.push(fee);
          break;
      }
    });
  }

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

  async openAddFeesDialog(): Promise<void> {
    const { AddEditFeesComponent } = await import('./add-edit-fees/add-edit-fees.component');
    const dialogRef = this.dialog.open(AddEditFeesComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '80vh',
      data: { mode: 'add' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(feesActions.fetchFees());
      }
    });
  }

  async openEditFeesDialog(fee: FeesModel): Promise<void> {
    const { AddEditFeesComponent } = await import('./add-edit-fees/add-edit-fees.component');
    const dialogRef = this.dialog.open(AddEditFeesComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '80vh',
      data: { mode: 'edit', fee: fee }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(feesActions.fetchFees());
      }
    });
  }
}