import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { ParentsModel } from '../../models/parents.model';
import { ParentsService } from '../../services/parents.service';

@Component({
  selector: 'app-add-edit-parent-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.parent ? 'Edit Parent' : 'Add Parent' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email" />
          <mat-error>Valid email required</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Title</mat-label>
          <mat-select formControlName="title">
            <mat-option value="Mr">Mr</mat-option>
            <mat-option value="Mrs">Mrs</mat-option>
            <mat-option value="Ms">Ms</mat-option>
            <mat-option value="Dr">Dr</mat-option>
            <mat-option value="Prof">Prof</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Surname</mat-label>
          <input matInput formControlName="surname" />
          <mat-error>Surname required</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Sex</mat-label>
          <mat-select formControlName="sex">
            <mat-option value="M">Male</mat-option>
            <mat-option value="F">Female</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>ID Number</mat-label>
          <input matInput formControlName="idnumber" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Cell</mat-label>
          <input matInput formControlName="cell" />
          <mat-error>Cell required</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Address</mat-label>
          <textarea matInput formControlName="address" rows="2"></textarea>
          <mat-error>Address required</mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-raised-button
        color="primary"
        (click)="onSubmit()"
        [disabled]="form.invalid || saving">
        {{ saving ? 'Saving...' : (data.parent ? 'Update' : 'Add') }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .full-width { width: 100%; }
      mat-dialog-content { min-width: 400px; }
    `,
  ],
})
export class AddEditParentDialogComponent {
  form: FormGroup;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private parentsService: ParentsService,
    private dialogRef: MatDialogRef<AddEditParentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { parent: ParentsModel | null },
  ) {
    const p = data.parent;
    this.form = this.fb.group({
      email: [p?.email ?? '', [Validators.required, Validators.email]],
      title: [p?.title ?? 'Mr', Validators.required],
      surname: [p?.surname ?? '', [Validators.required, Validators.minLength(2)]],
      sex: [p?.sex ?? 'M', Validators.required],
      idnumber: [p?.idnumber ?? ''],
      cell: [p?.cell ?? '', Validators.required],
      address: [p?.address ?? '', Validators.required],
    });
    if (p?.email) {
      this.form.get('email')?.disable();
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving) return;
    const value = this.form.getRawValue();
    this.saving = true;
    if (this.data.parent?.email) {
      this.parentsService
        .update(this.data.parent.email, value)
        .subscribe({
          next: (updated) => {
            this.dialogRef.close(updated);
          },
          error: () => {
            this.saving = false;
          },
        });
    } else {
      this.parentsService
        .create(value)
        .subscribe({
          next: (created) => {
            this.dialogRef.close(created);
          },
          error: () => {
            this.saving = false;
          },
        });
    }
  }
}
