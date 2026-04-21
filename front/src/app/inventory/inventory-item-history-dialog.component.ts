import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Subject, finalize, takeUntil } from 'rxjs';
import { InventoryAdjustment, InventoryApiService, InventoryItem } from './inventory-api.service';

@Component({
  selector: 'app-inventory-item-history-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
  ],
  templateUrl: './inventory-item-history-dialog.component.html',
  styleUrls: ['./inventory-item-history-dialog.component.scss'],
})
export class InventoryItemHistoryDialogComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  loading = false;
  adjustments: InventoryAdjustment[] = [];
  total = 0;
  pageIndex = 0;
  pageSize = 20;

  displayedColumns: string[] = ['createdAt', 'delta', 'reason', 'reference', 'createdBy'];

  constructor(
    private readonly inventoryApi: InventoryApiService,
    @Inject(MAT_DIALOG_DATA) public readonly data: { item: InventoryItem },
  ) {}

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPage(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.inventoryApi
      .getItemAdjustments(this.data.item.id, {
        page: this.pageIndex + 1,
        limit: this.pageSize,
      })
      .pipe(finalize(() => (this.loading = false)), takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.adjustments = result.items ?? [];
          this.total = result.total ?? 0;
        },
        error: () => {
          this.adjustments = [];
          this.total = 0;
        },
      });
  }
}

