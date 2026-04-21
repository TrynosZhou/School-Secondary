import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

type ParsedRow = {
  name: string;
  category?: string;
  unit?: string;
  quantityOnHand?: number;
  reorderLevel?: number | null;
  notes?: string | null;
};

function parseCsv(text: string): ParsedRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (!lines.length) return [];

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const idx = (name: string) => header.indexOf(name);

  const iName = idx('name');
  if (iName === -1) {
    throw new Error('CSV must include a "name" column');
  }

  const iCategory = idx('category');
  const iUnit = idx('unit');
  const iQty = idx('quantityonhand');
  const iReorder = idx('reorderlevel');
  const iNotes = idx('notes');

  const rows: ParsedRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim());
    const name = (cols[iName] || '').trim();
    if (!name) continue;

    const qty = iQty >= 0 ? Number(cols[iQty] || 0) : undefined;
    const reorder = iReorder >= 0 ? Number(cols[iReorder]) : undefined;

    rows.push({
      name,
      category: iCategory >= 0 ? (cols[iCategory] || '').trim() || undefined : undefined,
      unit: iUnit >= 0 ? (cols[iUnit] || '').trim() || undefined : undefined,
      quantityOnHand: Number.isFinite(qty as number) ? (qty as number) : undefined,
      reorderLevel:
        iReorder >= 0
          ? Number.isFinite(reorder as number)
            ? (reorder as number)
            : null
          : undefined,
      notes: iNotes >= 0 ? (cols[iNotes] || '').trim() || null : null,
    });
  }

  return rows;
}

@Component({
  selector: 'app-inventory-csv-import-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './inventory-csv-import-dialog.component.html',
  styleUrls: ['./inventory-dialogs.scss'],
})
export class InventoryCsvImportDialogComponent {
  csvControl = new FormControl<string>('');
  error: string | null = null;
  previewCount = 0;

  constructor(
    private readonly dialogRef: MatDialogRef<InventoryCsvImportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: { roomId: string; roomName: string },
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      this.csvControl.setValue(text);
      this.recalculatePreview();
    };
    reader.readAsText(file);
  }

  recalculatePreview(): void {
    this.error = null;
    try {
      const rows = parseCsv(this.csvControl.value || '');
      this.previewCount = rows.length;
    } catch (e: any) {
      this.previewCount = 0;
      this.error = e?.message || 'Failed to parse CSV';
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  import(): void {
    this.error = null;
    try {
      const rows = parseCsv(this.csvControl.value || '');
      if (!rows.length) {
        this.error = 'No rows found to import';
        return;
      }
      this.dialogRef.close({ items: rows });
    } catch (e: any) {
      this.error = e?.message || 'Failed to parse CSV';
    }
  }
}

