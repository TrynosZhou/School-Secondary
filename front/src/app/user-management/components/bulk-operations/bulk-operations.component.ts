/* eslint-disable prettier/prettier */
import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { ROLES, ROLES_FOR_SELECTION } from '../../../registration/models/roles.enum';
import { UserManagementModel } from '../../models/user-management.model';
import { userManagementActions } from '../../store/user-management.actions';
import { selectLoading, selectError } from '../../store/user-management.selectors';

export interface BulkOperationData {
  selectedUsers: UserManagementModel[];
  operation: 'delete' | 'update_role' | 'update_status' | 'reset_password' | 'export';
}

@Component({
  selector: 'app-bulk-operations',
  templateUrl: './bulk-operations.component.html',
  styleUrls: ['./bulk-operations.component.css']
})
export class BulkOperationsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  bulkOperationForm: FormGroup;
  loading$ = this.store.select(selectLoading);
  error$ = this.store.select(selectError);

  roles = ROLES_FOR_SELECTION;
  statuses = ['active', 'inactive', 'suspended'];

  selectedUsers: UserManagementModel[] = [];
  operation: string = '';

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private dialogRef: MatDialogRef<BulkOperationsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BulkOperationData
  ) {
    this.selectedUsers = data.selectedUsers;
    this.operation = data.operation;

    this.bulkOperationForm = this.fb.group({
      operation: [this.operation, [Validators.required]],
      newRole: [''],
      newStatus: [''],
      confirmAction: [false, [Validators.requiredTrue]]
    });
  }

  ngOnInit(): void {
    this.setupFormValidation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFormValidation(): void {
    // Add conditional validation based on operation
    this.bulkOperationForm.get('operation')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(operation => {
        const newRoleControl = this.bulkOperationForm.get('newRole');
        const newStatusControl = this.bulkOperationForm.get('newStatus');

        if (operation === 'update_role') {
          newRoleControl?.setValidators([Validators.required]);
          newStatusControl?.clearValidators();
        } else if (operation === 'update_status') {
          newStatusControl?.setValidators([Validators.required]);
          newRoleControl?.clearValidators();
        } else {
          newRoleControl?.clearValidators();
          newStatusControl?.clearValidators();
        }

        newRoleControl?.updateValueAndValidity();
        newStatusControl?.updateValueAndValidity();
      });
  }

  onSubmit(): void {
    if (this.bulkOperationForm.valid) {
      const formValue = this.bulkOperationForm.value;
      
      switch (formValue.operation) {
        case 'delete':
          this.performBulkDelete();
          break;
        case 'update_role':
          this.performBulkRoleUpdate(formValue.newRole);
          break;
        case 'update_status':
          this.performBulkStatusUpdate(formValue.newStatus);
          break;
        case 'reset_password':
          this.performBulkPasswordReset();
          break;
        case 'export':
          this.performBulkExport();
          break;
        default:
          console.error('Unknown operation:', formValue.operation);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  private performBulkDelete(): void {
    // TODO: Implement bulk delete
    console.log('Bulk delete users:', this.selectedUsers.map(u => u.id));
    this.dialogRef.close(true);
  }

  private performBulkRoleUpdate(newRole: string): void {
    // TODO: Implement bulk role update
    console.log('Bulk update role to:', newRole, 'for users:', this.selectedUsers.map(u => u.id));
    this.dialogRef.close(true);
  }

  private performBulkStatusUpdate(newStatus: string): void {
    // TODO: Implement bulk status update
    console.log('Bulk update status to:', newStatus, 'for users:', this.selectedUsers.map(u => u.id));
    this.dialogRef.close(true);
  }

  private performBulkPasswordReset(): void {
    // TODO: Implement bulk password reset
    console.log('Bulk reset password for users:', this.selectedUsers.map(u => u.id));
    this.dialogRef.close(true);
  }

  private performBulkExport(): void {
    // TODO: Implement bulk export
    console.log('Bulk export users:', this.selectedUsers.map(u => u.id));
    this.dialogRef.close(true);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.bulkOperationForm.controls).forEach(key => {
      const control = this.bulkOperationForm.get(key);
      control?.markAsTouched();
    });
  }

  getOperationTitle(): string {
    const titles: { [key: string]: string } = {
      'delete': 'Delete Users',
      'update_role': 'Update User Roles',
      'update_status': 'Update User Status',
      'reset_password': 'Reset User Passwords',
      'export': 'Export User Data'
    };
    return titles[this.operation] || 'Bulk Operation';
  }

  getOperationDescription(): string {
    const descriptions: { [key: string]: string } = {
      'delete': `This will permanently delete ${this.selectedUsers.length} user(s). This action cannot be undone.`,
      'update_role': `This will update the role of ${this.selectedUsers.length} user(s).`,
      'update_status': `This will update the status of ${this.selectedUsers.length} user(s).`,
      'reset_password': `This will reset the passwords of ${this.selectedUsers.length} user(s) and generate temporary passwords.`,
      'export': `This will export data for ${this.selectedUsers.length} user(s) to a CSV file.`
    };
    return descriptions[this.operation] || '';
  }

  getOperationIcon(): string {
    const icons: { [key: string]: string } = {
      'delete': 'delete_forever',
      'update_role': 'admin_panel_settings',
      'update_status': 'toggle_on',
      'reset_password': 'lock_reset',
      'export': 'download'
    };
    return icons[this.operation] || 'group_work';
  }

  getOperationColor(): string {
    const colors: { [key: string]: string } = {
      'delete': 'warn',
      'update_role': 'accent',
      'update_status': 'primary',
      'reset_password': 'accent',
      'export': 'primary'
    };
    return colors[this.operation] || 'primary';
  }

  getRoleDisplayName(role: string): string {
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  getStatusDisplayName(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  getSelectedUsersSummary(): string {
    if (this.selectedUsers.length <= 3) {
      return this.selectedUsers.map(u => u.username).join(', ');
    } else {
      const firstThree = this.selectedUsers.slice(0, 3).map(u => u.username).join(', ');
      const remaining = this.selectedUsers.length - 3;
      return `${firstThree} and ${remaining} other${remaining > 1 ? 's' : ''}`;
    }
  }
}


