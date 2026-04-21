/* eslint-disable prettier/prettier */
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info' | 'success';
  showCancel?: boolean;
}

@Component({
  selector: 'app-confirmation-dialog',
  template: `
    <div class="confirmation-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon [color]="getIconColor()">{{ getIcon() }}</mat-icon>
          {{ data.title }}
        </h2>
      </div>

      <mat-dialog-content class="dialog-content">
        <p class="confirmation-message">{{ data.message }}</p>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button 
          mat-button 
          (click)="onCancel()" 
          *ngIf="data.showCancel !== false"
          class="cancel-button">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button 
          mat-raised-button 
          [color]="getButtonColor()" 
          (click)="onConfirm()"
          class="confirm-button">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirmation-dialog {
      display: flex;
      flex-direction: column;
      min-width: 400px;
      max-width: 500px;
    }

    .dialog-header {
      padding: 1.5rem 1.5rem 0 1.5rem;
    }

    .dialog-header h2 {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .dialog-header h2 mat-icon {
      font-size: 1.5rem;
    }

    .dialog-content {
      padding: 1.5rem;
    }

    .confirmation-message {
      margin: 0;
      font-size: 1rem;
      color: #4a5568;
      line-height: 1.5;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1.5rem;
      border-top: 1px solid #e2e8f0;
    }

    .cancel-button {
      color: #718096;
    }

    .confirm-button {
      font-weight: 500;
    }

    @media (max-width: 480px) {
      .confirmation-dialog {
        min-width: 300px;
      }

      .dialog-header,
      .dialog-content,
      .dialog-actions {
        padding: 1rem;
      }

      .dialog-actions {
        flex-direction: column;
        align-items: stretch;
      }

      .cancel-button,
      .confirm-button {
        width: 100%;
      }
    }
  `]
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getIcon(): string {
    const icons = {
      'warning': 'warning',
      'danger': 'error',
      'info': 'info',
      'success': 'check_circle'
    };
    return icons[this.data.type || 'warning'] || icons['warning'];
  }

  getIconColor(): string {
    const colors = {
      'warning': 'warn',
      'danger': 'warn',
      'info': 'primary',
      'success': 'primary'
    };
    return colors[this.data.type || 'warning'] || colors['warning'];
  }

  getButtonColor(): string {
    const colors = {
      'warning': 'warn',
      'danger': 'warn',
      'info': 'primary',
      'success': 'primary'
    };
    return colors[this.data.type || 'warning'] || colors['warning'];
  }
}


