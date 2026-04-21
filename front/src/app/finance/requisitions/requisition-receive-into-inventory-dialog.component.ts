import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { InventoryApiService, Room } from 'src/app/inventory/inventory-api.service';
import { Requisition, RequisitionItem } from './requisitions.service';
import { finalize } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

type ReceiveLine = {
  item: RequisitionItem;
  remaining: number;
  receiveQty: number;
};

@Component({
  selector: 'app-requisition-receive-into-inventory-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
  ],
  templateUrl: './requisition-receive-into-inventory-dialog.component.html',
  styleUrls: ['./requisition-receive-into-inventory-dialog.component.scss'],
})
export class RequisitionReceiveIntoInventoryDialogComponent implements OnInit {
  rooms: Room[] = [];
  selectedRoomId: string | null = null;
  notes = '';
  saving = false;

  lines: ReceiveLine[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public readonly data: { requisition: Requisition },
    private readonly dialogRef: MatDialogRef<RequisitionReceiveIntoInventoryDialogComponent>,
    private readonly inventoryApi: InventoryApiService,
    private readonly snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    const items = this.data.requisition.items ?? [];
    this.lines = items.map((item) => {
      const ordered = Number(item.quantity ?? 0);
      const received = Number(item.receivedQuantity ?? 0);
      const remaining = Math.max(ordered - received, 0);
      return {
        item,
        remaining,
        receiveQty: remaining,
      };
    });

    this.inventoryApi
      .getRooms({ page: 1, limit: 200, isActive: 'true' })
      .subscribe({
        next: (res) => {
          this.rooms = res.items ?? [];
        },
        error: () => {
          this.rooms = [];
        },
      });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  receive(): void {
    if (!this.selectedRoomId) {
      this.snackBar.open('Please select a room', 'Close', { duration: 4000, verticalPosition: 'top' });
      return;
    }

    const lines = this.lines
      .filter((l) => l.receiveQty > 0 && l.remaining > 0)
      .map((l) => ({
        requisitionItemId: l.item.id as string,
        quantityReceived: Number(l.receiveQty),
      }));

    if (!lines.length) {
      this.snackBar.open('Nothing to receive', 'Close', { duration: 4000, verticalPosition: 'top' });
      return;
    }

    this.saving = true;
    this.inventoryApi
      .receiveRequisition({
        requisitionId: this.data.requisition.id,
        roomId: this.selectedRoomId,
        lines,
        notes: (this.notes || '').trim() || null,
      })
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.snackBar.open('Received into inventory', 'OK', { duration: 2500, verticalPosition: 'top' });
          this.dialogRef.close(true);
        },
        error: () => {
          this.snackBar.open('Failed to receive into inventory', 'Close', { duration: 5000, verticalPosition: 'top' });
        },
      });
  }
}

