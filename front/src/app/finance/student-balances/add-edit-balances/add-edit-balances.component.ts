import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { BalancesModel } from '../../models/balances.model';
import { Store } from '@ngrx/store';
import { balancesActions } from '../../store/finance.actions';
import { ThemeService, Theme } from 'src/app/services/theme.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-add-edit-balances',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './add-edit-balances.component.html',
  styleUrls: ['./add-edit-balances.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddEditBalancesComponent implements OnInit, OnDestroy {
  @Input()
  student!: StudentsModel;

  balancesForm!: FormGroup;
  currentTheme: Theme = 'light';
  
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    public themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.balancesForm = new FormGroup({
      amount: new FormControl('', Validators.required),
    });

    // Subscribe to theme changes
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe((theme) => {
        this.currentTheme = theme;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get amount() {
    return this.balancesForm.get('amount');
  }

  saveBalance() {
    if (this.balancesForm.valid && this.student) {
      const amount = this.amount?.value;
      const studentNumber = this.student.studentNumber;
      const balance: BalancesModel = {
        amount,
        studentNumber,
      };
      this.store.dispatch(balancesActions.saveBalance({ balance }));
      this.balancesForm.reset();
      this.cdr.markForCheck();
    }
  }
}
