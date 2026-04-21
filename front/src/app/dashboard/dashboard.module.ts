import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EnrolmentChartComponent } from './enrolment-chart/enrolment-chart.component';
import { NgChartsModule } from 'ng2-charts';
import { AccountsChartComponent } from './accounts-chart/accounts-chart.component';
import { MaterialModule } from '../material/material.module';
import { ClassAttendanceSummaryComponent } from './class-attendance-summary/class-attendance-summary.component';
import { FinanceModule } from '../finance/finance.module';
import { ReportsModule } from '../reports/reports.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FinanceDashboardComponent } from './finance-dashboard/finance-dashboard.component';
import { FilterFinanceDialogComponent } from './finance-dashboard/filter-finance-dialog/filter-finance-dialog.component';
import { SearchFinanceEntityComponent } from './finance-dashboard/search-finance-entity/search-finance-entity.component';
import { StoreModule } from '@ngrx/store';
import { dashboardReducer } from './store/dashboard.reducer';
import { EffectsModule } from '@ngrx/effects';
import { DashboardEffects } from './store/dashboard.effects';
import { TeachersDashboardComponent } from './teachers-dashboard/teachers-dashboard.component';
import { StudentDashboardComponent } from './student-dashboard/student-dashboard.component';
import { DashboardCardComponent } from './dashboard-card/dashboard-card.component';
import { ParentDashboardComponent } from './parent-dashboard/parent-dashboard.component';

@NgModule({
  declarations: [
    DashboardComponent,
    EnrolmentChartComponent,
    AccountsChartComponent,
    ClassAttendanceSummaryComponent,
    FinanceDashboardComponent,
    FilterFinanceDialogComponent,
    SearchFinanceEntityComponent,
    TeachersDashboardComponent,
    StudentDashboardComponent,
    DashboardCardComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgChartsModule,
    MaterialModule,
    FinanceModule,
    ReportsModule,
    StoreModule.forFeature('dashboard', dashboardReducer),
    EffectsModule.forFeature([DashboardEffects]),
    ParentDashboardComponent, // standalone
  ],
})
export class DashboardModule {}
