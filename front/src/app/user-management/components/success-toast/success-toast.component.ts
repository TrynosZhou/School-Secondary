/* eslint-disable prettier/prettier */
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-success-toast',
  template: `
    <div class="success-toast">
      <div class="toast-content">
        <mat-icon class="success-icon">{{ getIcon() }}</mat-icon>
        <div class="toast-message">
          <p class="message-text">{{ message }}</p>
          <p class="message-subtext" *ngIf="subtext">{{ subtext }}</p>
        </div>
        <button mat-icon-button (click)="onDismiss()" class="dismiss-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .success-toast {
      background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
      border: 1px solid #38a169;
      overflow: hidden;
    }

    .toast-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
    }

    .success-icon {
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
      color: white;
    }

    .toast-message {
      flex: 1;
    }

    .message-text {
      margin: 0;
      font-size: 1rem;
      font-weight: 500;
      color: white;
    }

    .message-subtext {
      margin: 0.25rem 0 0 0;
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.9);
    }

    .dismiss-button {
      color: white;
      width: 32px;
      height: 32px;
    }

    .dismiss-button:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .success-toast.warning {
      background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
      box-shadow: 0 4px 12px rgba(237, 137, 54, 0.3);
      border-color: #dd6b20;
    }

    .success-toast.error {
      background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
      box-shadow: 0 4px 12px rgba(245, 101, 101, 0.3);
      border-color: #e53e3e;
    }

    .success-toast.info {
      background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
      box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
      border-color: #3182ce;
    }

    @media (max-width: 480px) {
      .toast-content {
        padding: 0.75rem 1rem;
        gap: 0.75rem;
      }

      .message-text {
        font-size: 0.9rem;
      }

      .message-subtext {
        font-size: 0.8rem;
      }
    }
  `]
})
export class SuccessToastComponent implements OnInit, OnDestroy {
  @Input() message: string = '';
  @Input() subtext: string = '';
  @Input() type: 'success' | 'warning' | 'error' | 'info' = 'success';
  @Input() duration: number = 5000;

  private timeoutId?: number;

  constructor(private snackBarRef: MatSnackBarRef<SuccessToastComponent>) {}

  ngOnInit(): void {
    if (this.duration > 0) {
      this.timeoutId = window.setTimeout(() => {
        this.onDismiss();
      }, this.duration);
    }
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  onDismiss(): void {
    this.snackBarRef.dismiss();
  }

  getIcon(): string {
    const icons = {
      'success': 'check_circle',
      'warning': 'warning',
      'error': 'error',
      'info': 'info'
    };
    return icons[this.type] || icons['success'];
  }
}


