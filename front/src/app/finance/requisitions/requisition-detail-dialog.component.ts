import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { Requisition, RequisitionsService } from './requisitions.service';
import { ROLES } from 'src/app/registration/models/roles.enum';
import { MatDialog } from '@angular/material/dialog';
import { RequisitionReceiveIntoInventoryDialogComponent } from './requisition-receive-into-inventory-dialog.component';

export interface RequisitionDetailDialogData {
  requisition: Requisition;
  role: ROLES;
}

@Component({
  selector: 'app-requisition-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    RequisitionReceiveIntoInventoryDialogComponent,
  ],
  templateUrl: './requisition-detail-dialog.component.html',
  styleUrls: ['./requisition-detail-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequisitionDetailDialogComponent {
  saving = false;
  rejectReason = '';

  displayedColumns: string[] = ['quantity', 'description', 'intendedUse'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: RequisitionDetailDialogData,
    private readonly dialogRef: MatDialogRef<RequisitionDetailDialogComponent>,
    private readonly requisitionsService: RequisitionsService,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog,
  ) {}

  get req(): Requisition {
    return this.data.requisition;
  }

  canSignDeputy(): boolean {
    return this.data.role === ROLES.deputy && (this.req.status === 'in_review_deputy' || this.req.status === 'submitted');
  }

  canSignHead(): boolean {
    return this.data.role === ROLES.head && this.req.status === 'in_review_head';
  }

  canAuthoriseOrReject(): boolean {
    return (this.data.role === ROLES.auditor || this.data.role === ROLES.director) && this.req.status === 'awaiting_authorization';
  }

  canReceiveIntoInventory(): boolean {
    return this.data.role === ROLES.hod && this.req.status === 'authorized';
  }

  private finish(updated: Requisition): void {
    this.dialogRef.close(updated);
  }

  signDeputy(): void {
    this.saving = true;
    this.requisitionsService
      .signAsDeputy(this.req.id)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: (updated) => {
          this.snackBar.open('Signed as deputy', 'OK', { duration: 2500, verticalPosition: 'top' });
          this.finish(updated);
        },
        error: () => this.snackBar.open('Failed to sign as deputy', 'Close', { duration: 5000, verticalPosition: 'top' }),
      });
  }

  signHead(): void {
    this.saving = true;
    this.requisitionsService
      .signAsHead(this.req.id)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: (updated) => {
          this.snackBar.open('Signed as head', 'OK', { duration: 2500, verticalPosition: 'top' });
          this.finish(updated);
        },
        error: () => this.snackBar.open('Failed to sign as head', 'Close', { duration: 5000, verticalPosition: 'top' }),
      });
  }

  authorise(): void {
    this.saving = true;
    this.requisitionsService
      .authorise(this.req.id)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: (updated) => {
          this.snackBar.open('Requisition authorised', 'OK', { duration: 2500, verticalPosition: 'top' });
          this.finish(updated);
        },
        error: () => this.snackBar.open('Failed to authorise', 'Close', { duration: 5000, verticalPosition: 'top' }),
      });
  }

  reject(): void {
    const reason = (this.rejectReason || '').trim();
    if (!reason) {
      this.snackBar.open('Rejection reason is required', 'Close', { duration: 4000, verticalPosition: 'top' });
      return;
    }
    this.saving = true;
    this.requisitionsService
      .reject(this.req.id, reason)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: (updated) => {
          this.snackBar.open('Requisition rejected', 'OK', { duration: 2500, verticalPosition: 'top' });
          this.finish(updated);
        },
        error: () => this.snackBar.open('Failed to reject', 'Close', { duration: 5000, verticalPosition: 'top' }),
      });
  }

  receiveIntoInventory(): void {
    const ref = this.dialog.open(RequisitionReceiveIntoInventoryDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      data: { requisition: this.req },
    });

    ref.afterClosed().subscribe((didReceive?: boolean) => {
      if (!didReceive) return;
      // Reload requisition from backend so received quantities are reflected.
      this.requisitionsService.getRequisitionById(this.req.id).subscribe({
        next: (updated) => this.finish(updated),
        error: () => this.finish(this.req),
      });
    });
  }
}

