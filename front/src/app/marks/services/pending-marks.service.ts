import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MarksModel } from '../models/marks.model';

const PENDING_MARKS_KEY = 'pending_marks';

function markKey(mark: MarksModel): string {
  const sn = mark.student?.studentNumber ?? '';
  const code = mark.subject?.code ?? '';
  return `${sn}_${code}_${mark.num}_${mark.year}`;
}

@Injectable({
  providedIn: 'root',
})
export class PendingMarksService {
  private pending: MarksModel[] = [];
  private readonly pendingCount$ = new BehaviorSubject<number>(0);

  constructor() {
    this.restoreFromStorage();
  }

  add(mark: MarksModel): void {
    this.remove(mark);
    this.pending.push(mark);
    this.sync();
  }

  remove(mark: MarksModel): void {
    const key = markKey(mark);
    this.pending = this.pending.filter((m) => markKey(m) !== key);
    this.sync();
  }

  getAll(): MarksModel[] {
    return [...this.pending];
  }

  getPendingCount(): number {
    return this.pending.length;
  }

  get pendingCount(): Observable<number> {
    return this.pendingCount$.asObservable();
  }

  private sync(): void {
    this.pendingCount$.next(this.pending.length);
    try {
      if (this.pending.length > 0) {
        localStorage.setItem(PENDING_MARKS_KEY, JSON.stringify(this.pending));
      } else {
        localStorage.removeItem(PENDING_MARKS_KEY);
      }
    } catch {
      // ignore storage errors
    }
  }

  private restoreFromStorage(): void {
    try {
      const raw = localStorage.getItem(PENDING_MARKS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as MarksModel[];
        if (Array.isArray(parsed)) {
          this.pending = parsed;
          this.pendingCount$.next(this.pending.length);
        }
      }
    } catch {
      this.pending = [];
    }
  }
}
