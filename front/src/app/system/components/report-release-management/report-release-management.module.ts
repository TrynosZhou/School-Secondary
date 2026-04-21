import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ReportReleaseManagementComponent } from './report-release-management.component';
import { GenerateSessionsDialogComponent } from './generate-sessions-dialog/generate-sessions-dialog.component';
import { BulkUpdateDialogComponent } from './bulk-update-dialog/bulk-update-dialog.component';
import { EditReleaseDialogComponent } from './edit-release-dialog/edit-release-dialog.component';

// Material Design Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  declarations: [
    ReportReleaseManagementComponent,
    GenerateSessionsDialogComponent,
    BulkUpdateDialogComponent,
    EditReleaseDialogComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatCheckboxModule,
  ],
  exports: [
    ReportReleaseManagementComponent,
  ],
})
export class ReportReleaseManagementModule {}
