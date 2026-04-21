/* eslint-disable prettier/prettier */
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="loading-container" *ngIf="loading">
      <div class="loading-content">
        <mat-spinner [diameter]="size" [color]="color"></mat-spinner>
        <p class="loading-text" *ngIf="message">{{ message }}</p>
        <p class="loading-subtext" *ngIf="subtext">{{ subtext }}</p>
      </div>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 12px;
      margin: 1rem 0;
    }

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      text-align: center;
    }

    .loading-text {
      margin: 0;
      font-size: 1rem;
      font-weight: 500;
      color: #4a5568;
    }

    .loading-subtext {
      margin: 0;
      font-size: 0.875rem;
      color: #718096;
    }

    .loading-container.overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.95);
      z-index: 1000;
      margin: 0;
      border-radius: 0;
    }

    .loading-container.inline {
      padding: 1rem;
      margin: 0;
      background: transparent;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() loading: boolean = false;
  @Input() message: string = '';
  @Input() subtext: string = '';
  @Input() size: number = 50;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() type: 'default' | 'overlay' | 'inline' = 'default';
}


