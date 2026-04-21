import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddEditBalancesComponent } from './add-edit-balances/add-edit-balances.component';
import { ThemeService, Theme } from 'src/app/services/theme.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-student-balances',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatCardModule,
    MatIconModule,
    SharedModule,
    AddEditBalancesComponent,
  ],
  templateUrl: './student-balances.component.html',
  styleUrls: ['./student-balances.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentBalancesComponent implements OnInit, OnDestroy {
  selectedStudent!: StudentsModel;
  currentTheme: Theme = 'light';
  
  private destroy$ = new Subject<void>();

  constructor(
    public title: Title,
    public themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
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

  getSelectedStudent(student: StudentsModel) {
    this.selectedStudent = student;
    this.cdr.markForCheck();
  }
}
