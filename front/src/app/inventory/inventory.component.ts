import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { combineLatest, debounceTime, distinctUntilChanged, finalize, map, of, startWith, Subject, switchMap, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { ROLES } from 'src/app/registration/models/roles.enum';
import { DepartmentsApiService, DepartmentDetails } from 'src/app/system/departments/departments-api.service';
import {
  InventoryApiService,
  InventoryItem,
  Room,
  RoomSummary,
} from './inventory-api.service';
import { InventoryCreateRoomDialogComponent } from './inventory-create-room-dialog.component';
import { InventoryCreateItemDialogComponent } from './inventory-create-item-dialog.component';
import { InventoryAdjustStockDialogComponent } from './inventory-adjust-stock-dialog.component';
import { InventoryStocktakeDialogComponent } from './inventory-stocktake-dialog.component';
import { InventoryTransferDialogComponent } from './inventory-transfer-dialog.component';
import { InventoryItemHistoryDialogComponent } from './inventory-item-history-dialog.component';
import { InventoryCsvImportDialogComponent } from './inventory-csv-import-dialog.component';

type ViewMode = 'rooms' | 'room';
type RoomsTab = 'rooms' | 'lowStock';

@Component({
  selector: 'app-inventory',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
    MatSnackBarModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTabsModule,
    InventoryCreateRoomDialogComponent,
    InventoryCreateItemDialogComponent,
    InventoryAdjustStockDialogComponent,
    InventoryStocktakeDialogComponent,
    InventoryTransferDialogComponent,
    InventoryItemHistoryDialogComponent,
    InventoryCsvImportDialogComponent,
  ],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
})
export class InventoryComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  readonly ROLES = ROLES;

  viewMode: ViewMode = 'rooms';
  roomsTab: RoomsTab = 'rooms';
  role: ROLES | null = null;

  canManageInventory = false;
  canFilterDepartment = false;

  departments: DepartmentDetails[] = [];
  selectedDepartmentIdControl = new FormControl<string | null>(null);

  roomSearchControl = new FormControl<string>('');
  roomPageIndex = 0;
  roomPageSize = 20;

  rooms: Room[] = [];
  roomsTotal = 0;
  selectedRoom: Room | null = null;
  selectedRoomSummary: RoomSummary | null = null;
  roomsForTransfer: Room[] = [];

  itemSearchControl = new FormControl<string>('');
  itemCategoryControl = new FormControl<string>('');
  belowReorderOnlyControl = new FormControl<boolean>(false);
  includeInactiveRoomsControl = new FormControl<boolean>(false);
  includeInactiveItemsControl = new FormControl<boolean>(false);
  itemPageIndex = 0;
  itemPageSize = 25;

  items: InventoryItem[] = [];
  itemsTotal = 0;

  lowStockSearchControl = new FormControl<string>('');
  lowStockPageIndex = 0;
  lowStockPageSize = 25;
  lowStockItems: InventoryItem[] = [];
  lowStockTotal = 0;
  loadingLowStock = false;

  lowStockDisplayedColumns: string[] = [
    'item',
    'room',
    'category',
    'quantityOnHand',
    'reorderLevel',
    'unit',
    'actions',
  ];

  roomsDisplayedColumns: string[] = ['name', 'code', 'department', 'active', 'actions'];
  itemsDisplayedColumns: string[] = [
    'name',
    'category',
    'quantityOnHand',
    'reorderLevel',
    'unit',
    'actions',
  ];

  loadingRooms = false;
  loadingItems = false;

  constructor(
    private readonly inventoryApi: InventoryApiService,
    private readonly departmentsApi: DepartmentsApiService,
    private readonly authService: AuthService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    const auth = this.authService.getAuthStatus();
    this.role = auth.user?.role ?? null;

    this.canManageInventory =
      this.role === ROLES.hod ||
      this.role === ROLES.deputy ||
      this.role === ROLES.head ||
      this.role === ROLES.admin ||
      this.role === ROLES.dev;

    this.canFilterDepartment =
      this.role === ROLES.deputy ||
      this.role === ROLES.head ||
      this.role === ROLES.director ||
      this.role === ROLES.auditor ||
      this.role === ROLES.admin ||
      this.role === ROLES.dev;

    if (this.canFilterDepartment) {
      this.departmentsApi
        .getDepartments()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (departments) => {
            this.departments = departments ?? [];
          },
          error: () => {
            this.departments = [];
          },
        });
    }

    this.setupRoomsStream();
    this.setupItemsStream();
    this.setupLowStockStream();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openRoom(room: Room): void {
    this.selectedRoom = room;
    this.viewMode = 'room';
    this.itemPageIndex = 0;
    this.selectedRoomSummary = null;
    this.roomsForTransfer = [];

    this.inventoryApi
      .getRoomSummary(room.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (summary) => {
          this.selectedRoomSummary = summary;
        },
        error: () => {
          this.selectedRoomSummary = null;
        },
      });

    // Preload rooms list for transfer dropdown (within allowed scope)
    this.inventoryApi
      .getRooms({ page: 1, limit: 200, isActive: 'true' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.roomsForTransfer = (result.items ?? []).filter((r) => r.id !== room.id);
        },
        error: () => {
          this.roomsForTransfer = [];
        },
      });
  }

  backToRooms(): void {
    this.selectedRoom = null;
    this.selectedRoomSummary = null;
    this.viewMode = 'rooms';
    this.items = [];
    this.itemsTotal = 0;
  }

  onRoomsPageChange(event: PageEvent): void {
    this.roomPageIndex = event.pageIndex;
    this.roomPageSize = event.pageSize;
    this.refreshRooms();
  }

  onItemsPageChange(event: PageEvent): void {
    this.itemPageIndex = event.pageIndex;
    this.itemPageSize = event.pageSize;
    this.refreshItems();
  }

  onLowStockPageChange(event: PageEvent): void {
    this.lowStockPageIndex = event.pageIndex;
    this.lowStockPageSize = event.pageSize;
    this.refreshLowStock();
  }

  createRoom(): void {
    if (!this.canManageInventory) {
      this.snackBar.open(
        'Only deputy, head, admin, hod, or dev can create rooms',
        'Close',
        { duration: 4000 },
      );
      return;
    }

    const ref = this.dialog.open(InventoryCreateRoomDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      data: { mode: 'create' },
    });

    ref.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result?: { name: string; code?: string; description?: string }) => {
        if (!result) return;
        this.loadingRooms = true;
        this.inventoryApi
          .createRoom(result)
          .pipe(finalize(() => (this.loadingRooms = false)), takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open('Room created', 'OK', { duration: 2500 });
              this.refreshRooms();
            },
            error: () => {
              this.snackBar.open('Failed to create room', 'Close', { duration: 5000 });
            },
          });
      });
  }

  editRoom(room: Room): void {
    if (!this.canManageInventory) {
      this.snackBar.open('Only HOD can manage rooms', 'Close', { duration: 4000 });
      return;
    }

    const ref = this.dialog.open(InventoryCreateRoomDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      data: { mode: 'edit', room },
    });

    ref.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result?: { name: string; code?: string; description?: string }) => {
        if (!result) return;
        this.loadingRooms = true;
        this.inventoryApi
          .updateRoom(room.id, {
            name: result.name,
            code: result.code ?? null,
            description: result.description ?? null,
          })
          .pipe(finalize(() => (this.loadingRooms = false)), takeUntil(this.destroy$))
          .subscribe({
            next: (updated) => {
              this.snackBar.open('Room updated', 'OK', { duration: 2500 });
              this.rooms = this.rooms.map((r) => (r.id === updated.id ? updated : r));
              if (this.selectedRoom?.id === updated.id) {
                this.selectedRoom = updated;
              }
              this.refreshRooms();
            },
            error: () => {
              this.snackBar.open('Failed to update room', 'Close', { duration: 5000 });
            },
          });
      });
  }

  archiveRoom(room: Room): void {
    if (!this.canManageInventory) {
      this.snackBar.open('Only HOD can manage rooms', 'Close', { duration: 4000 });
      return;
    }
    this.loadingRooms = true;
    this.inventoryApi
      .updateRoom(room.id, { isActive: false })
      .pipe(finalize(() => (this.loadingRooms = false)), takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Room archived', 'OK', { duration: 2500 });
          this.refreshRooms();
        },
        error: () => {
          this.snackBar.open('Failed to archive room', 'Close', { duration: 5000 });
        },
      });
  }

  restoreRoom(room: Room): void {
    if (!this.canManageInventory) {
      this.snackBar.open('Only HOD can manage rooms', 'Close', { duration: 4000 });
      return;
    }
    this.loadingRooms = true;
    this.inventoryApi
      .updateRoom(room.id, { isActive: true })
      .pipe(finalize(() => (this.loadingRooms = false)), takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Room restored', 'OK', { duration: 2500 });
          this.refreshRooms();
        },
        error: () => {
          this.snackBar.open('Failed to restore room', 'Close', { duration: 5000 });
        },
      });
  }

  createItem(): void {
    if (!this.canManageInventory || !this.selectedRoom) {
      this.snackBar.open('Only HOD can add inventory items', 'Close', { duration: 4000 });
      return;
    }

    const ref = this.dialog.open(InventoryCreateItemDialogComponent, {
      width: '620px',
      maxWidth: '95vw',
      data: { room: this.selectedRoom, mode: 'create' },
    });

    ref.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result?: { name: string; category?: string; unit?: string; reorderLevel?: number | null; notes?: string | null; quantityOnHand?: number }) => {
        if (!result || !this.selectedRoom) return;
        this.loadingItems = true;
        this.inventoryApi
          .createItem({ roomId: this.selectedRoom.id, ...result })
          .pipe(finalize(() => (this.loadingItems = false)), takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open('Item added', 'OK', { duration: 2500 });
              this.refreshItems();
              this.refreshRoomSummary();
            },
            error: () => {
              this.snackBar.open('Failed to add item', 'Close', { duration: 5000 });
            },
          });
      });
  }

  editItem(item: InventoryItem): void {
    if (!this.canManageInventory || !this.selectedRoom) {
      this.snackBar.open('Only HOD can update inventory items', 'Close', { duration: 4000 });
      return;
    }

    const ref = this.dialog.open(InventoryCreateItemDialogComponent, {
      width: '620px',
      maxWidth: '95vw',
      data: { room: this.selectedRoom, mode: 'edit', item },
    });

    ref.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result?: { name: string; category?: string; unit?: string; reorderLevel?: number | null; notes?: string | null }) => {
        if (!result) return;
        this.loadingItems = true;
        this.inventoryApi
          .updateItem(item.id, {
            name: result.name,
            category: result.category ?? null,
            unit: result.unit ?? null,
            reorderLevel:
              result.reorderLevel === undefined ? null : result.reorderLevel,
            notes: result.notes ?? null,
          })
          .pipe(finalize(() => (this.loadingItems = false)), takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open('Item updated', 'OK', { duration: 2500 });
              this.refreshItems();
              this.refreshRoomSummary();
            },
            error: () => {
              this.snackBar.open('Failed to update item', 'Close', { duration: 5000 });
            },
          });
      });
  }

  importCsv(): void {
    if (!this.canManageInventory || !this.selectedRoom) {
      this.snackBar.open('Only HOD can import items', 'Close', { duration: 4000 });
      return;
    }

    const ref = this.dialog.open(InventoryCsvImportDialogComponent, {
      width: '860px',
      maxWidth: '95vw',
      data: { roomId: this.selectedRoom.id, roomName: this.selectedRoom.name },
    });

    ref.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result?: { items: any[] }) => {
        if (!result || !this.selectedRoom) return;
        this.loadingItems = true;
        this.inventoryApi
          .bulkCreateItems({ roomId: this.selectedRoom.id, items: result.items })
          .pipe(finalize(() => (this.loadingItems = false)), takeUntil(this.destroy$))
          .subscribe({
            next: (resp) => {
              this.snackBar.open(`Imported ${resp.created} items`, 'OK', { duration: 3000 });
              this.refreshItems();
              this.refreshRoomSummary();
            },
            error: () => {
              this.snackBar.open('Failed to import items', 'Close', { duration: 5000 });
            },
          });
      });
  }

  adjustStock(item: InventoryItem): void {
    if (!this.canManageInventory) {
      this.snackBar.open('Only HOD can adjust stock', 'Close', { duration: 4000 });
      return;
    }

    const ref = this.dialog.open(InventoryAdjustStockDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      data: { item },
    });

    ref.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result?: { delta: number; reason: string; reference?: string | null; notes?: string | null }) => {
        if (!result) return;
        this.loadingItems = true;
        this.inventoryApi
          .adjustItem(item.id, result)
          .pipe(finalize(() => (this.loadingItems = false)), takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open('Stock updated', 'OK', { duration: 2500 });
              this.refreshItems();
              this.refreshRoomSummary();
            },
            error: () => {
              this.snackBar.open('Failed to adjust stock', 'Close', { duration: 5000 });
            },
          });
      });
  }

  archiveItem(item: InventoryItem): void {
    if (!this.canManageInventory) {
      this.snackBar.open('Only HOD can manage items', 'Close', { duration: 4000 });
      return;
    }
    this.loadingItems = true;
    this.inventoryApi
      .updateItem(item.id, { isActive: false })
      .pipe(finalize(() => (this.loadingItems = false)), takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Item archived', 'OK', { duration: 2500 });
          this.refreshItems();
          this.refreshRoomSummary();
        },
        error: () => {
          this.snackBar.open('Failed to archive item', 'Close', { duration: 5000 });
        },
      });
  }

  restoreItem(item: InventoryItem): void {
    if (!this.canManageInventory) {
      this.snackBar.open('Only HOD can manage items', 'Close', { duration: 4000 });
      return;
    }
    this.loadingItems = true;
    this.inventoryApi
      .updateItem(item.id, { isActive: true })
      .pipe(finalize(() => (this.loadingItems = false)), takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Item restored', 'OK', { duration: 2500 });
          this.refreshItems();
          this.refreshRoomSummary();
        },
        error: () => {
          this.snackBar.open('Failed to restore item', 'Close', { duration: 5000 });
        },
      });
  }

  stocktake(item: InventoryItem): void {
    if (!this.canManageInventory) {
      this.snackBar.open('Only HOD can stocktake', 'Close', { duration: 4000 });
      return;
    }

    const ref = this.dialog.open(InventoryStocktakeDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      data: { item },
    });

    ref.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result?: { quantityOnHand: number; reference?: string | null; notes?: string | null }) => {
        if (!result) return;
        this.loadingItems = true;
        this.inventoryApi
          .stocktakeItem(item.id, result)
          .pipe(finalize(() => (this.loadingItems = false)), takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open('Stocktake saved', 'OK', { duration: 2500 });
              this.refreshItems();
              this.refreshRoomSummary();
            },
            error: () => {
              this.snackBar.open('Failed to save stocktake', 'Close', { duration: 5000 });
            },
          });
      });
  }

  transfer(item: InventoryItem): void {
    if (!this.canManageInventory) {
      this.snackBar.open('Only HOD can transfer stock', 'Close', { duration: 4000 });
      return;
    }
    if (!this.roomsForTransfer.length) {
      this.snackBar.open('No destination rooms available', 'Close', { duration: 4000 });
      return;
    }

    const ref = this.dialog.open(InventoryTransferDialogComponent, {
      width: '580px',
      maxWidth: '95vw',
      data: { item, rooms: this.roomsForTransfer },
    });

    ref.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result?: { toRoomId: string; quantity: number; reference?: string | null; notes?: string | null }) => {
        if (!result) return;
        this.loadingItems = true;
        this.inventoryApi
          .transferStock({
            fromItemId: item.id,
            toRoomId: result.toRoomId,
            quantity: result.quantity,
            reference: result.reference ?? null,
            notes: result.notes ?? null,
          })
          .pipe(finalize(() => (this.loadingItems = false)), takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open('Transfer completed', 'OK', { duration: 2500 });
              this.refreshItems();
              this.refreshRoomSummary();
            },
            error: () => {
              this.snackBar.open('Failed to transfer stock', 'Close', { duration: 5000 });
            },
          });
      });
  }

  openHistory(item: InventoryItem): void {
    this.dialog.open(InventoryItemHistoryDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      data: { item },
    });
  }

  private setupRoomsStream(): void {
    const departmentId$ = this.selectedDepartmentIdControl.valueChanges.pipe(
      startWith(this.selectedDepartmentIdControl.value),
      distinctUntilChanged(),
    );
    const search$ = this.roomSearchControl.valueChanges.pipe(
      startWith(this.roomSearchControl.value ?? ''),
      map((value) => (value ?? '').toString()),
      debounceTime(250),
      distinctUntilChanged(),
    );

    const includeInactive$ = this.includeInactiveRoomsControl.valueChanges.pipe(
      startWith(this.includeInactiveRoomsControl.value ?? false),
      distinctUntilChanged(),
    );

    combineLatest([departmentId$, search$, includeInactive$])
      .pipe(
        switchMap(([departmentId, query, includeInactive]) => {
          this.loadingRooms = true;
          return this.inventoryApi
            .getRooms({
              page: this.roomPageIndex + 1,
              limit: this.roomPageSize,
              departmentId: this.canFilterDepartment ? (departmentId ?? undefined) : undefined,
              q: query.trim() || undefined,
              isActive: includeInactive ? undefined : 'true',
            })
            .pipe(
              finalize(() => {
                this.loadingRooms = false;
              }),
            );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (result) => {
          this.rooms = result.items ?? [];
          this.roomsTotal = result.total ?? 0;
        },
        error: () => {
          this.rooms = [];
          this.roomsTotal = 0;
        },
      });
  }

  private setupItemsStream(): void {
    const search$ = this.itemSearchControl.valueChanges.pipe(
      startWith(this.itemSearchControl.value ?? ''),
      map((value) => (value ?? '').toString()),
      debounceTime(250),
      distinctUntilChanged(),
    );
    const category$ = this.itemCategoryControl.valueChanges.pipe(
      startWith(this.itemCategoryControl.value ?? ''),
      map((value) => (value ?? '').toString()),
      debounceTime(200),
      distinctUntilChanged(),
    );
    const belowReorder$ = this.belowReorderOnlyControl.valueChanges.pipe(
      startWith(this.belowReorderOnlyControl.value ?? false),
      distinctUntilChanged(),
    );

    const includeInactive$ = this.includeInactiveItemsControl.valueChanges.pipe(
      startWith(this.includeInactiveItemsControl.value ?? false),
      distinctUntilChanged(),
    );

    combineLatest([search$, category$, belowReorder$, includeInactive$])
      .pipe(
        switchMap(([query, category, belowReorder, includeInactive]) => {
          const roomId = this.selectedRoom?.id;
          if (!roomId) {
            return of(null);
          }

          this.loadingItems = true;
          return this.inventoryApi
            .getItems({
              page: this.itemPageIndex + 1,
              limit: this.itemPageSize,
              roomId,
              q: query.trim() || undefined,
              category: category.trim() || undefined,
              belowReorder: belowReorder ? 'true' : undefined,
              isActive: includeInactive ? undefined : 'true',
            })
            .pipe(finalize(() => (this.loadingItems = false)));
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (result) => {
          if (!result) {
            this.items = [];
            this.itemsTotal = 0;
            return;
          }
          this.items = result.items ?? [];
          this.itemsTotal = result.total ?? 0;
        },
        error: () => {
          this.items = [];
          this.itemsTotal = 0;
        },
      });
  }

  private refreshRooms(): void {
    const current = this.roomSearchControl.value ?? '';
    this.roomSearchControl.setValue(current);
  }

  private refreshItems(): void {
    const current = this.itemSearchControl.value ?? '';
    this.itemSearchControl.setValue(current);
  }

  private refreshLowStock(): void {
    const current = this.lowStockSearchControl.value ?? '';
    this.lowStockSearchControl.setValue(current);
  }

  private setupLowStockStream(): void {
    const departmentId$ = this.selectedDepartmentIdControl.valueChanges.pipe(
      startWith(this.selectedDepartmentIdControl.value),
      distinctUntilChanged(),
    );

    const search$ = this.lowStockSearchControl.valueChanges.pipe(
      startWith(this.lowStockSearchControl.value ?? ''),
      map((value) => (value ?? '').toString()),
      debounceTime(250),
      distinctUntilChanged(),
    );

    combineLatest([departmentId$, search$])
      .pipe(
        switchMap(([departmentId, query]) => {
          this.loadingLowStock = true;
          return this.inventoryApi
            .getItems({
              page: this.lowStockPageIndex + 1,
              limit: this.lowStockPageSize,
              departmentId: this.canFilterDepartment ? (departmentId ?? undefined) : undefined,
              q: query.trim() || undefined,
              belowReorder: 'true',
              isActive: 'true',
            })
            .pipe(finalize(() => (this.loadingLowStock = false)));
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (result) => {
          this.lowStockItems = result.items ?? [];
          this.lowStockTotal = result.total ?? 0;
        },
        error: () => {
          this.lowStockItems = [];
          this.lowStockTotal = 0;
        },
      });
  }

  private refreshRoomSummary(): void {
    if (!this.selectedRoom) return;
    this.inventoryApi
      .getRoomSummary(this.selectedRoom.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (summary) => {
          this.selectedRoomSummary = summary;
        },
        error: () => {
          this.selectedRoomSummary = null;
        },
      });
  }
}

