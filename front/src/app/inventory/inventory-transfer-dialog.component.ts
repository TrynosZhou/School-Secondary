import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { InventoryItem, Room } from './inventory-api.service';

@Component({
  selector: 'app-inventory-transfer-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './inventory-transfer-dialog.component.html',
  styleUrls: ['./inventory-dialogs.scss'],
})
export class InventoryTransferDialogComponent {
  form = this.fb.group({
    toRoomId: ['', [Validators.required]],
    quantity: [1, [Validators.required, Validators.min(1)]],
    reference: ['', [Validators.maxLength(120)]],
    notes: ['', [Validators.maxLength(500)]],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<InventoryTransferDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public readonly data: { item: InventoryItem; rooms: Room[] },
  ) {}

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
      toRoomId: (value.toRoomId || '').toString(),
      quantity: Number(value.quantity ?? 1),
      reference: (value.reference || '').toString().trim() || null,
      notes: (value.notes || '').toString().trim() || null,
    });
  }
}

