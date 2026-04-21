import { Routes } from '@angular/router';

export const STUDENT_FINANCIALS_ROUTES: Routes = [
  { path: '', redirectTo: 'invoices', pathMatch: 'full' },
  {
    path: 'invoices',
    loadComponent: () => import('./student-invoices/student-invoices.component').then(m => m.StudentInvoicesComponent),
    title: 'Invoices',
  },
  {
    path: 'receipts',
    loadComponent: () => import('./student-receipts/student-receipts.component').then(m => m.StudentReceiptsComponent),
    title: 'Receipts',
  },
  {
    path: 'payment-history',
    loadComponent: () => import('./student-payment-history/student-payment-history.component').then(m => m.StudentPaymentHistoryComponent),
    title: 'Payment History',
  },
];

