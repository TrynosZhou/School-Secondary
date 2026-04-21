import { CommonModule } from '@angular/common';
import {
  Component,
  Inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DepartmentModel } from '../../user-management/models/user-management.model';
import { UserManagementService } from '../../user-management/services/user-management.service';

@Component({
  selector: 'app-department-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './department-edit-dialog.component.html',
  styleUrls: ['./department-edit-dialog.component.scss'],
})
export class DepartmentEditDialogComponent {
  form: FormGroup;
  loading = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly userManagementService: UserManagementService,
    private readonly snackBar: MatSnackBar,
    private readonly dialogRef: MatDialogRef<DepartmentEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { department: DepartmentModel },
  ) {
    this.form = this.fb.group({
      name: [data.department.name || '', [Validators.required, Validators.maxLength(150)]],
      description: [data.department.description || '', [Validators.maxLength(500)]],
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, description } = this.form.value;
    this.loading = true;

    this.userManagementService
      .updateDepartment(this.data.department.id, {
        name: (name || '').trim(),
        description: (description || '').trim() || undefined,
      })
      .subscribe({
        next: (updated) => {
          this.loading = false;
          this.snackBar.open('Department updated', 'OK', {
            duration: 3000,
            verticalPosition: 'top',
          });
          this.dialogRef.close(updated);
        },
        error: () => {
          this.loading = false;
          this.snackBar.open('Failed to update department', 'Close', {
            duration: 5000,
            verticalPosition: 'top',
          });
        },
      });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

