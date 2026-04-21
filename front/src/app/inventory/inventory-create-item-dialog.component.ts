import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Room } from './inventory-api.service';
import { InventoryItem } from './inventory-api.service';

type ItemDialogData = {
  room: Room;
  mode?: 'create' | 'edit';
  item?: InventoryItem;
};

@Component({
  selector: 'app-inventory-create-item-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
  ],
  templateUrl: './inventory-create-item-dialog.component.html',
  styleUrls: ['./inventory-dialogs.scss'],
})
export class InventoryCreateItemDialogComponent {
  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(160)]],
    category: ['', [Validators.maxLength(80)]],
    unit: ['', [Validators.maxLength(40)]],
    quantityOnHand: [0, [Validators.min(0)]],
    reorderLevel: [null as number | null, [Validators.min(0)]],
    notes: ['', [Validators.maxLength(500)]],
  });

  mode: 'create' | 'edit' = 'create';

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<InventoryCreateItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: ItemDialogData,
  ) {}

  ngOnInit(): void {
    this.mode = this.data?.mode === 'edit' ? 'edit' : 'create';
    if (this.mode === 'edit' && this.data?.item) {
      this.form.patchValue({
        name: this.data.item.name || '',
        category: this.data.item.category || '',
        unit: this.data.item.unit || '',
        quantityOnHand: Number(this.data.item.quantityOnHand ?? 0),
        reorderLevel:
          this.data.item.reorderLevel === null ||
          this.data.item.reorderLevel === undefined
            ? null
            : Number(this.data.item.reorderLevel),
        notes: this.data.item.notes || '',
      });
    }
  }

  get title(): string {
    return this.mode === 'edit' ? 'Edit item' : 'Add item';
  }

  get contextSubtitle(): string {
    return this.mode === 'edit' ? 'Update inventory item details' : 'New inventory item';
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
    const quantityOnHand = Number(value.quantityOnHand ?? 0);
    const reorderLevelRaw = value.reorderLevel as number | null;
    const reorderLevel =
      reorderLevelRaw === null || reorderLevelRaw === undefined
        ? null
        : Number(reorderLevelRaw);

    const payload: any = {
      name: (value.name || '').trim(),
      category: (value.category || '').trim() || undefined,
      unit: (value.unit || '').trim() || undefined,
      reorderLevel: Number.isFinite(reorderLevel as number) ? reorderLevel : null,
      notes: (value.notes || '').trim() || null,
    };

    if (this.mode === 'create') {
      payload.quantityOnHand = Number.isFinite(quantityOnHand) ? quantityOnHand : 0;
    }

    this.dialogRef.close(payload);
  }
}

