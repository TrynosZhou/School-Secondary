import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SigninComponent } from './auth/signin/signin.component';
import { SignupComponent } from './auth/signup/signup.component';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { AuthGuardService } from './auth/auth-guard.service';
import { StudentsListComponent } from './registration/students-list/students-list.component';
import { TeachersListComponent } from './registration/teachers-list/teachers-list.component';
import { TermsClassesComponent } from './enrolment/terms-classes/terms-classes.component';
import { TermsComponent } from './enrolment/terms-classes/terms/terms.component';
import { ClassesComponent } from './enrolment/terms-classes/classes/classes.component';
import { SubjectsComponent } from './marks/subjects/subjects.component';
import { EnterMarksComponent } from './marks/enter-marks/enter-marks.component';
import { ReportsComponent } from './reports/reports/reports.component';
import { MarkRegisterComponent } from './attendance/mark-register/mark-register.component';
import { AttendanceReportsComponent } from './attendance/attendance-reports/attendance-reports.component';
import { MigrateClassEnrolmentComponent } from './enrolment/migrate-class-enrolment/migrate-class-enrolment.component';
import { MarksSheetsComponent } from './marks/marks-sheets/marks-sheets.component';
import { ProfileComponent } from './auth/profile/profile.component';
import { TeacherViewComponent } from './registration/teachers-list/teacher-view/teacher-view.component';
import { StudentViewComponent } from './registration/students-list/student-view/student-view.component';
import { ParentsListComponent } from './registration/parents-list/parents-list.component';
import { ClassListsComponent } from './enrolment/terms-classes/class-lists/class-lists.component';
import { MarksProgressComponent } from './marks/marks-progress/marks-progress.component';
// FeesComponent is lazy loaded
// StudentFinanceComponent is lazy loaded
// StudentBalancesComponent is now standalone and lazy loaded
// InvoiceComponent is lazy loaded
// PaymentsComponent is now standalone and lazy loaded
// StudentFinancialsDashboardComponent is now standalone and lazy loaded
// StudentInvoicesComponent is now standalone and lazy loaded
// StudentReceiptsComponent is now standalone and lazy loaded
// StudentPaymentHistoryComponent is now standalone and lazy loaded
// StudentLedgerReportComponent is now standalone and lazy loaded
// OutstandingFeesReportComponent is now standalone and lazy loaded
import { FeesCollectionReportComponent } from './finance/reports/fees-collection-report/fees-collection-report.component';
// OutstandingFeesReportComponent is now standalone and lazy loaded
// AgedDebtorsReportComponent is now standalone and lazy-loaded
import { RevenueRecognitionReportComponent } from './finance/reports/revenue-recognition-report/revenue-recognition-report.component';
// EnrollmentBillingReconciliationReportComponent is now standalone and lazy-loaded
import { ResultsAnalysisComponent } from './results-analysis/results-analysis.component';
import { ExemptionReportsComponent } from './finance/reports/exemption-reports/exemption-reports/exemption-reports.component';
// Lazy loaded - removed direct import
import { ROUTE_POLICIES } from './auth/route-policies';

export const APP_ROUTES: Routes = [
  { path: 'signin', component: SigninComponent, title: 'Sign In' },
  { path: 'signup', component: SignupComponent, title: 'Sign Up' },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuardService],
    title: 'Profile',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    title: 'Dashboard',
    canActivate: [AuthGuardService],
  },
  {
    path: 'parent-dashboard',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'teachers',
    component: TeachersListComponent,
    canActivate: [AuthGuardService],
    data: ROUTE_POLICIES.teachers,
    title: 'Manage Teachers',
  },
  {
    path: 'teacher-view/:id',
    component: TeacherViewComponent,
    canActivate: [AuthGuardService],
    title: 'Teacher Details',
  },
  {
    path: 'student-financials',
    loadComponent: () => import('./finance/student-financials/student-financials-dashboard/student-financials-dashboard.component').then(m => m.StudentFinancialsDashboardComponent),
    canActivate: [AuthGuardService],
    title: 'Finance overview',
    loadChildren: () => import('./finance/student-financials/student-financials.routes').then(m => m.STUDENT_FINANCIALS_ROUTES),
  },
  {
    path: 'students',
    component: StudentsListComponent,
    canActivate: [AuthGuardService],
    data: ROUTE_POLICIES.students,
    title: 'Manage Students',
  },
  {
    path: 'student-view/:studentNumber',
    component: StudentViewComponent,
    canActivate: [AuthGuardService],
    title: 'Student Details',
  },
  {
    path: 'parents',
    component: ParentsListComponent,
    canActivate: [AuthGuardService],
    data: ROUTE_POLICIES.parents,
    title: 'Manage Parents',
  },
  {
    path: 'classes',
    component: ClassesComponent,
    canActivate: [AuthGuardService],
    title: 'Manage Classes',
  },
  {
    path: 'terms',
    component: TermsComponent,
    canActivate: [AuthGuardService],
    title: 'Manage Terms',
  },
  {
    path: 'enrol',
    component: TermsClassesComponent,
    canActivate: [AuthGuardService],
    title: 'Enrol Students',
  },
  {
    path: 'class-lists',
    component: ClassListsComponent,
    canActivate: [AuthGuardService],
    title: 'Class Lists',
  },
  {
    path: 'migrate-class',
    component: MigrateClassEnrolmentComponent,
    canActivate: [AuthGuardService],
    title: 'Migrate Class Enrolment',
  },
  {
    path: 'subjects',
    component: SubjectsComponent,
    canActivate: [AuthGuardService],
    title: 'Manage Subjects',
  },
  {
    path: 'input',
    component: EnterMarksComponent,
    canActivate: [AuthGuardService],
    title: 'Enter Marks',
  },
  {
    path: 'marks-progress',
    component: MarksProgressComponent,
    canActivate: [AuthGuardService],
    title: 'Marks Capture Progress',
  },
  {
    path: 'mark-sheets',
    component: MarksSheetsComponent,
    canActivate: [AuthGuardService],
    title: 'Mark Sheets',
  },
  {
    path: 'marks/continuous',
    loadComponent: () =>
      import('./marks/continuous-assessment/continuous-assessment.component').then(
        (m) => m.ContinuousAssessmentComponent,
      ),
    canActivate: [AuthGuardService],
    title: 'Continuous Assessment',
  },

  {
    path: 'reports',
    component: ReportsComponent,
    canActivate: [AuthGuardService],
    title: 'Progress Reports',
  },
  {
    path: 'mark-register',
    component: MarkRegisterComponent,
    canActivate: [AuthGuardService],
    title: 'Mark Attendance Register',
  },
  {
    path: 'attendance-reports',
    component: AttendanceReportsComponent,
    canActivate: [AuthGuardService],
    title: 'Attendance Reports',
  },
  {
    path: 'results-analysis',
    component: ResultsAnalysisComponent,
    canActivate: [AuthGuardService],
    title: 'Results Analysis',
  },
  {
    path: 'fees',
    loadComponent: () => import('./finance/fees/fees.component').then(m => m.FeesComponent),
    canActivate: [AuthGuardService],
    data: ROUTE_POLICIES.fees,
    title: 'Manage Fees',
  },
  {
    path: 'balances',
    loadComponent: () => import('./finance/student-balances/student-balances.component').then(m => m.StudentBalancesComponent),
    canActivate: [AuthGuardService],
    data: ROUTE_POLICIES.balances,
    title: 'Manage Balances',
  },
  {
    path: 'invoice',
    loadComponent: () => import('./finance/student-finance/invoice/invoice.component').then(m => m.InvoiceComponent),
    canActivate: [AuthGuardService],
    data: ROUTE_POLICIES.invoice,
    title: 'Invoice Management',
  },
  {
    path: 'student-finance',
    loadComponent: () => import('./finance/student-finance/student-finance.component').then(m => m.StudentFinanceComponent),
    canActivate: [AuthGuardService],
    title: 'Individual Student Finance',
  },
  {
    path: 'payments',
    loadComponent: () => import('./finance/payments/payments.component').then(m => m.PaymentsComponent),
    canActivate: [AuthGuardService],
    data: ROUTE_POLICIES.payments,
    title: 'Receipting',
  },
  {
    path: 'system/departments',
    loadComponent: () => import('./system/departments/departments.component').then(m => m.DepartmentsComponent),
    canActivate: [AuthGuardService],
    data: ROUTE_POLICIES.systemDepartments,
    title: 'Departments',
  },
  {
    path: 'requisitions',
    loadComponent: () => import('./finance/requisitions/requisitions.component').then(m => m.RequisitionsComponent),
    canActivate: [AuthGuardService],
    title: 'Department Requisitions',
  },
  {
    path: 'inventory',
    loadComponent: () => import('./inventory/inventory.component').then(m => m.InventoryComponent),
    canActivate: [AuthGuardService],
    title: 'Department Inventory',
  },
  {
    path: 'library',
    loadComponent: () => import('./library/library.component').then(m => m.LibraryComponent),
    canActivate: [AuthGuardService],
    title: 'Library Management',
  },
  {
    path: 'incidents',
    loadComponent: () => import('./incidents/incidents.component').then(m => m.IncidentsComponent),
    canActivate: [AuthGuardService],
    title: 'Lost & Damaged Items',
  },
  {
    path: 'exemptions',
    loadComponent: () => import('./finance/exemptions/exemptions.component').then(m => m.ExemptionsComponent),
    canActivate: [AuthGuardService],
    title: 'Exemption Management',
  },
  {
    canActivate: [AuthGuardService],
    path: 'student-ledger',
    loadComponent: () => import('./finance/reports/student-ledger-report/student-ledger-report.component').then(m => m.StudentLedgerReportComponent),
    title: 'Student Ledger Reports',
  },
  {
    canActivate: [AuthGuardService],
    path: 'fees-collection',
    component: FeesCollectionReportComponent,
    title: 'Fees Collection Report',
  },
  {
    canActivate: [AuthGuardService],
    path: 'outstanding-fees',
    loadComponent: () => import('./finance/reports/outstanding-fees-report/outstanding-fees-report.component').then(m => m.OutstandingFeesReportComponent),
    title: 'Outstanding Fees Report',
  },
  {
    canActivate: [AuthGuardService],
    path: 'exemption-reports',
    component: ExemptionReportsComponent,
    title: 'Exemption Reports',
  },
  {
    canActivate: [AuthGuardService],
    path: 'aged-debtors',
    loadComponent: () => import('./finance/reports/aged-debtors-report/aged-debtors-report.component').then(m => m.AgedDebtorsReportComponent),
    title: 'Aged Debtors Report',
  },
  {
    canActivate: [AuthGuardService],
    path: 'enrollment-billing-reconciliation',
    loadComponent: () => import('./finance/reports/enrollment-billing-reconciliation-report/enrollment-billing-reconciliation-report.component').then(m => m.EnrollmentBillingReconciliationReportComponent),
    title: 'Enrollment vs. Billing Reconciliation',
  },
  {
    canActivate: [AuthGuardService],
    path: 'revenue-recognition',
    component: RevenueRecognitionReportComponent,
    title: 'Revenue Recognition',
  },
  {
    canActivate: [AuthGuardService],
    path: 'student-reconciliation',
    loadComponent: () => import('./finance/reports/student-reconciliation/student-reconciliation.component').then(m => m.StudentReconciliationComponent),
    title: 'Student Finance Reconciliation',
  },
  {
    canActivate: [AuthGuardService],
    path: 'class-reconciliation',
    loadComponent: () => import('./finance/reports/class-reconciliation/class-reconciliation.component').then(m => m.ClassReconciliationComponent),
    title: 'Class Finance Reconciliation',
  },
  {
    path: 'user-management',
    loadChildren: () => import('./user-management/user-management.module').then(m => m.UserManagementModule),
    canActivate: [AuthGuardService],
    data: ROUTE_POLICIES.userManagement,
    title: 'User Management',
  },
  {
    path: 'system/roles',
    loadComponent: () => import('./system/roles-permissions/roles-permissions.component').then(m => m.RolesPermissionsComponent),
    canActivate: [AuthGuardService],
    data: ROUTE_POLICIES.systemRoles,
    title: 'Roles & Permissions',
  },
  {
    path: 'system/academic',
    loadComponent: () => import('./system/academic-settings/academic-settings.component').then(m => m.AcademicSettingsComponent),
    canActivate: [AuthGuardService],
    data: ROUTE_POLICIES.systemAcademic,
    title: 'Academic Settings',
  },
  {
    path: 'system/settings',
    loadComponent: () => import('./system/system-settings/system-settings.component').then(m => m.SystemSettingsComponent),
    canActivate: [AuthGuardService],
    data: ROUTE_POLICIES.systemSettings,
    title: 'System Settings',
  },
  {
    path: 'system/audit',
    loadComponent: () => import('./system/audit-logs/audit-logs.component').then(m => m.AuditLogsComponent),
    canActivate: [AuthGuardService],
    data: ROUTE_POLICIES.systemAudit,
    title: 'Audit Logs',
  },
  {
    path: 'system/analytics',
    loadComponent: () => import('./system/analytics/analytics.component').then(m => m.AnalyticsComponent),
    canActivate: [AuthGuardService],
    data: ROUTE_POLICIES.systemAnalytics,
    title: 'Analytics & Reports',
  },
  {
    path: 'system/integrations',
    loadComponent: () => import('./system/integrations/integrations.component').then(m => m.IntegrationsComponent),
    canActivate: [AuthGuardService],
    data: ROUTE_POLICIES.systemIntegrations,
    title: 'Integrations',
  },
  {
    path: 'calendar',
    loadComponent: () => import('./system/calendar/calendar.component').then(m => m.CalendarComponent),
    canActivate: [AuthGuardService],
    title: 'Calendar',
  },
  {
    path: 'messaging',
    loadComponent: () => import('./messaging/messaging.component').then(m => m.MessagingComponent),
    canActivate: [AuthGuardService],
    title: 'Messages',
  },
  {
    path: 'messaging/:id',
    loadComponent: () => import('./messaging/messaging.component').then(m => m.MessagingComponent),
    canActivate: [AuthGuardService],
    title: 'Messages',
  },
  {
    path: '',
    redirectTo: 'signin',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'signin',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(APP_ROUTES)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
