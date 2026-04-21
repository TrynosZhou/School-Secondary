import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export interface DepartmentSummary {
  id: string;
  name: string;
}

export interface Room {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  isActive: boolean;
  departmentId: string;
  department?: DepartmentSummary;
  createdAt: string;
  updatedAt: string;
}

export interface RoomSummary {
  roomId: string;
  itemCount: number;
  totalQuantityOnHand: number;
  lowStockCount: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category?: string | null;
  unit?: string | null;
  quantityOnHand: number;
  reorderLevel?: number | null;
  notes?: string | null;
  isActive: boolean;
  roomId: string;
  departmentId: string;
  room?: Room;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryAdjustment {
  id: string;
  createdAt: string;
  delta: number;
  reason: string;
  reference?: string | null;
  notes?: string | null;
  createdByTeacherId: string;
  createdBy?: { id: string; name: string; surname: string };
}

export interface CreateRoomPayload {
  name: string;
  code?: string;
  description?: string;
}

export interface UpdateRoomPayload {
  name?: string;
  code?: string | null;
  description?: string | null;
  isActive?: boolean;
}

export interface CreateItemPayload {
  roomId: string;
  name: string;
  category?: string;
  unit?: string;
  quantityOnHand?: number;
  reorderLevel?: number | null;
  notes?: string | null;
}

export interface UpdateItemPayload {
  name?: string;
  category?: string | null;
  unit?: string | null;
  reorderLevel?: number | null;
  notes?: string | null;
  isActive?: boolean;
}

export interface AdjustItemPayload {
  delta: number;
  reason: string;
  reference?: string | null;
  notes?: string | null;
}

export interface StocktakeItemPayload {
  quantityOnHand: number;
  reference?: string | null;
  notes?: string | null;
}

export interface TransferStockPayload {
  fromItemId: string;
  toRoomId: string;
  quantity: number;
  reference?: string | null;
  notes?: string | null;
}

export interface BulkCreateItemsPayload {
  roomId: string;
  items: Array<{
    name: string;
    category?: string;
    unit?: string;
    quantityOnHand?: number;
    reorderLevel?: number | null;
    notes?: string | null;
  }>;
}

@Injectable({ providedIn: 'root' })
export class InventoryApiService {
  private readonly baseUrl = `${environment.apiUrl}/inventory`;

  constructor(private readonly http: HttpClient) {}

  getRooms(params: {
    page?: number;
    limit?: number;
    q?: string;
    departmentId?: string;
    isActive?: string;
  }): Observable<PaginatedResult<Room>> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.limit) httpParams = httpParams.set('limit', params.limit);
    if (params.q) httpParams = httpParams.set('q', params.q);
    if (params.departmentId) httpParams = httpParams.set('departmentId', params.departmentId);
    if (params.isActive) httpParams = httpParams.set('isActive', params.isActive);

    return this.http.get<PaginatedResult<Room>>(`${this.baseUrl}/rooms`, {
      params: httpParams,
    });
  }

  createRoom(payload: CreateRoomPayload): Observable<Room> {
    return this.http.post<Room>(`${this.baseUrl}/rooms`, payload);
  }

  updateRoom(roomId: string, payload: UpdateRoomPayload): Observable<Room> {
    return this.http.patch<Room>(`${this.baseUrl}/rooms/${roomId}`, payload);
  }

  getRoomSummary(roomId: string): Observable<RoomSummary> {
    return this.http.get<RoomSummary>(`${this.baseUrl}/rooms/${roomId}/summary`);
  }

  getItems(params: {
    page?: number;
    limit?: number;
    q?: string;
    departmentId?: string;
    roomId?: string;
    category?: string;
    belowReorder?: string;
    isActive?: string;
  }): Observable<PaginatedResult<InventoryItem>> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.limit) httpParams = httpParams.set('limit', params.limit);
    if (params.q) httpParams = httpParams.set('q', params.q);
    if (params.departmentId) httpParams = httpParams.set('departmentId', params.departmentId);
    if (params.roomId) httpParams = httpParams.set('roomId', params.roomId);
    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.belowReorder) httpParams = httpParams.set('belowReorder', params.belowReorder);
    if (params.isActive) httpParams = httpParams.set('isActive', params.isActive);

    return this.http.get<PaginatedResult<InventoryItem>>(`${this.baseUrl}/items`, {
      params: httpParams,
    });
  }

  createItem(payload: CreateItemPayload): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(`${this.baseUrl}/items`, payload);
  }

  updateItem(itemId: string, payload: UpdateItemPayload): Observable<InventoryItem> {
    return this.http.patch<InventoryItem>(`${this.baseUrl}/items/${itemId}`, payload);
  }

  adjustItem(itemId: string, payload: AdjustItemPayload): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(`${this.baseUrl}/items/${itemId}/adjust`, payload);
  }

  stocktakeItem(itemId: string, payload: StocktakeItemPayload): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(`${this.baseUrl}/items/${itemId}/stocktake`, payload);
  }

  getItemAdjustments(itemId: string, params: { page?: number; limit?: number }): Observable<PaginatedResult<InventoryAdjustment>> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.limit) httpParams = httpParams.set('limit', params.limit);

    return this.http.get<PaginatedResult<InventoryAdjustment>>(
      `${this.baseUrl}/items/${itemId}/adjustments`,
      { params: httpParams },
    );
  }

  transferStock(payload: TransferStockPayload): Observable<{ fromItem: InventoryItem; toItem: InventoryItem }> {
    return this.http.post<{ fromItem: InventoryItem; toItem: InventoryItem }>(`${this.baseUrl}/transfer`, payload);
  }

  bulkCreateItems(payload: BulkCreateItemsPayload): Observable<{ created: number }> {
    return this.http.post<{ created: number }>(`${this.baseUrl}/items/bulk`, payload);
  }

  receiveRequisition(payload: {
    requisitionId: string;
    roomId: string;
    lines: Array<{ requisitionItemId: string; quantityReceived: number }>;
    notes?: string | null;
  }): Observable<{ requisitionId: string; receivedLines: number }> {
    return this.http.post<{ requisitionId: string; receivedLines: number }>(
      `${this.baseUrl}/receive-requisition`,
      payload,
    );
  }
}

