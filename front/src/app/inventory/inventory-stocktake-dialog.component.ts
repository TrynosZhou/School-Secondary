import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { InventoryItem } from './inventory-api.service';

@Component({
  selector: 'app-inventory-stocktake-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './inventory-stocktake-dialog.component.html',
  styleUrls: ['./inventory-dialogs.scss'],
})
export class InventoryStocktakeDialogComponent {
  form = this.fb.group({
    quantityOnHand: [0, [Validators.required, Validators.min(0)]],
    reference: ['', [Validators.maxLength(120)]],
    notes: ['', [Validators.maxLength(500)]],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<InventoryStocktakeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: { item: InventoryItem },
  ) {
    this.form.patchValue({ quantityOnHand: data.item.quantityOnHand });
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
      quantityOnHand: Number(value.quantityOnHand ?? 0),
      reference: (value.reference || '').toString().trim() || null,
      notes: (value.notes || '').toString().trim() || null,
    });
  }
}

