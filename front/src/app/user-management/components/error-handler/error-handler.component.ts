/* eslint-disable prettier/prettier */
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-error-handler',
  template: `
    <div class="error-container" *ngIf="error">
      <div class="error-content">
        <mat-icon class="error-icon">{{ getErrorIcon() }}</mat-icon>
        <div class="error-details">
          <h3 class="error-title">{{ getErrorTitle() }}</h3>
          <p class="error-message">{{ error }}</p>
          <div class="error-actions" *ngIf="showRetry">
            <button mat-raised-button color="primary" (click)="onRetry()">
              <mat-icon>refresh</mat-icon>
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: #fff5f5;
      border: 1px solid #fed7d7;
      border-radius: 12px;
      margin: 1rem 0;
    }

    .error-content {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      max-width: 600px;
    }

    .error-icon {
      font-size: 3rem;
      color: #e53e3e;
      width: 3rem;
      height: 3rem;
    }

    .error-details {
      flex: 1;
    }

    .error-title {
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #2d3748;
    }

    .error-message {
      margin: 0 0 1rem 0;
      color: #4a5568;
      line-height: 1.5;
    }

    .error-actions {
      display: flex;
      gap: 1rem;
    }

    .error-actions button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    @media (max-width: 768px) {
      .error-content {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class ErrorHandlerComponent implements OnInit {
  @Input() error: string | null = null;
  @Input() showRetry: boolean = true;
  @Input() errorType: 'network' | 'validation' | 'permission' | 'server' | 'unknown' = 'unknown';

  ngOnInit(): void {}

  getErrorIcon(): string {
    const icons = {
      'network': 'wifi_off',
      'validation': 'error_outline',
      'permission': 'lock',
      'server': 'dns',
      'unknown': 'error'
    };
    return icons[this.errorType] || icons['unknown'];
  }

  getErrorTitle(): string {
    const titles = {
      'network': 'Connection Error',
      'validation': 'Validation Error',
      'permission': 'Access Denied',
      'server': 'Server Error',
      'unknown': 'An Error Occurred'
    };
    return titles[this.errorType] || titles['unknown'];
  }

  onRetry(): void {
    // Emit retry event or call parent method
    window.location.reload();
  }
}


