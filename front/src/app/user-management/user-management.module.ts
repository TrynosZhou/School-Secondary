/* eslint-disable prettier/prettier */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';

// Components
import { UserListComponent } from './components/user-list/user-list.component';
import { CreateUserDialogComponent } from './components/create-user/create-user-dialog.component';
import { UserDetailsDialogComponent } from './components/user-details/user-details-dialog.component';
import { UserActivityComponent } from './components/user-activity/user-activity.component';
import { BulkOperationsComponent } from './components/bulk-operations/bulk-operations.component';
import { SystemActivityComponent } from './components/system-activity/system-activity.component';
import { ErrorHandlerComponent } from './components/error-handler/error-handler.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { SuccessToastComponent } from './components/success-toast/success-toast.component';

// Store
import { userManagementReducer } from './store/user-management.reducer';
import { UserManagementEffects } from './store/user-management.effects';

// Services
import { UserManagementService } from './services/user-management.service';

// Shared
import { UserManagementRoutingModule } from './user-management-routing.module';
import { EditUserDialogComponent } from './components/edit-user/edit-user-dialog.component';
import { ResetPasswordDialogComponent } from './components/reset-password/reset-password-dialog.component';
// ConfirmDialogComponent is now standalone and shared - lazy loaded when needed

@NgModule({
  declarations: [
    BulkOperationsComponent,
    ErrorHandlerComponent,
    LoadingSpinnerComponent,
    ConfirmationDialogComponent,
    SuccessToastComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    
    // Material Modules
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatRadioModule,

    // Store
    StoreModule.forFeature('userManagement', userManagementReducer),
    EffectsModule.forFeature([UserManagementEffects]),

    // Standalone components
    UserListComponent,
    CreateUserDialogComponent,
    UserDetailsDialogComponent,
    EditUserDialogComponent,
    ResetPasswordDialogComponent,
    UserActivityComponent,
    SystemActivityComponent,

    // Routing
    UserManagementRoutingModule,
  ],
  providers: [UserManagementService],
  exports: [
    UserListComponent,
    CreateUserDialogComponent,
    UserDetailsDialogComponent,
    UserActivityComponent,
    BulkOperationsComponent,
    ErrorHandlerComponent,
    LoadingSpinnerComponent,
    ConfirmationDialogComponent,
    SuccessToastComponent,
  ]
})
export class UserManagementModule {}
