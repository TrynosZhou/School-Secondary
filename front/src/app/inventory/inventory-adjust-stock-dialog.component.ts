import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { InventoryItem } from './inventory-api.service';

const ADJUSTMENT_REASONS = [
  { value: 'stocktake', label: 'Stocktake' },
  { value: 'issue', label: 'Issue / used' },
  { value: 'received', label: 'Received' },
  { value: 'transfer_in', label: 'Transfer in' },
  { value: 'transfer_out', label: 'Transfer out' },
  { value: 'correction', label: 'Correction' },
] as const;

@Component({
  selector: 'app-inventory-adjust-stock-dialog',
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
  templateUrl: './inventory-adjust-stock-dialog.component.html',
  styleUrls: ['./inventory-dialogs.scss'],
})
export class InventoryAdjustStockDialogComponent {
  readonly reasons = ADJUSTMENT_REASONS;

  form = this.fb.group({
    delta: [0, [Validators.required]],
    reason: ['stocktake', [Validators.required]],
    reference: ['', [Validators.maxLength(120)]],
    notes: ['', [Validators.maxLength(500)]],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<InventoryAdjustStockDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: { item: InventoryItem },
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
    const delta = Number(value.delta ?? 0);

    this.dialogRef.close({
      delta,
      reason: (value.reason || 'stocktake').toString(),
      reference: (value.reference || '').toString().trim() || null,
      notes: (value.notes || '').toString().trim() || null,
    });
  }
}

