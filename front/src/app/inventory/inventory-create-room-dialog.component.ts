import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Room } from './inventory-api.service';

type RoomDialogData = {
  mode?: 'create' | 'edit';
  room?: Room;
};

@Component({
  selector: 'app-inventory-create-room-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './inventory-create-room-dialog.component.html',
})
export class InventoryCreateRoomDialogComponent {
  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    code: ['', [Validators.maxLength(40)]],
    description: ['', [Validators.maxLength(500)]],
  });

  mode: 'create' | 'edit' = 'create';

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<InventoryCreateRoomDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: RoomDialogData | null,
  ) {}

  ngOnInit(): void {
    this.mode = this.data?.mode === 'edit' ? 'edit' : 'create';
    if (this.mode === 'edit' && this.data?.room) {
      this.form.patchValue({
        name: this.data.room.name || '',
        code: this.data.room.code || '',
        description: this.data.room.description || '',
      });
    }
  }

  get title(): string {
    return this.mode === 'edit' ? 'Edit room' : 'Add room';
  }

  get saveLabel(): string {
    return this.mode === 'edit' ? 'Update' : 'Save';
  }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.value;
    this.dialogRef.close({
      name: (value.name || '').trim(),
      code: (value.code || '').trim() || undefined,
      description: (value.description || '').trim() || undefined,
    });
  }
}

