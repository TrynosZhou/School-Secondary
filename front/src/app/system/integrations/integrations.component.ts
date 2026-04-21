import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import {
  IntegrationService,
  Integration,
  IntegrationType,
  IntegrationStatus,
  CreateIntegrationDto,
  UpdateIntegrationDto,
  IntegrationStatusSummary,
} from '../services/integration.service';
import { of } from 'rxjs';
import { IntegrationDialogComponent } from './integration-dialog.component';

@Component({
  selector: 'app-integrations',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatTableModule,
    MatDialogModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './integrations.component.html',
  styleUrls: ['./integrations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntegrationsComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['name', 'type', 'status', 'isTestMode', 'lastSyncAt', 'actions'];
  integrations: Integration[] = [];
  statusSummary: IntegrationStatusSummary | null = null;
  isLoading = false;

  integrationTypes = Object.values(IntegrationType);
  integrationStatuses = Object.values(IntegrationStatus);

  private destroy$ = new Subject<void>();

  constructor(
    private integrationService: IntegrationService,
    private title: Title,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Integrations');
    
    // Check if user has a valid token
    const token = localStorage.getItem('token');
    if (!token) {
      this.snackBar.open('You are not logged in. Please log in to access integrations.', 'Close', {
        duration: 5000,
      });
      return;
    }
    
    // Check if token is expired
    try {
      const decoded: any = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = decoded.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      
      if (expiryTime < now) {
        console.warn('Token expired. Expiry:', new Date(expiryTime), 'Now:', new Date(now));
        this.snackBar.open('Your session has expired. Please log out and log back in.', 'Close', {
          duration: 5000,
        });
        // Don't load integrations if token is expired
        return;
      }
    } catch (e) {
      console.warn('Could not decode token for expiration check:', e);
      // Continue anyway - let backend validate
    }
    
    this.loadIntegrations();
    this.loadStatusSummary();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadIntegrations(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.integrationService
      .getAllIntegrations()
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error loading integrations:', error);
          if (error.status === 401) {
            // Check if token is actually expired
            const token = localStorage.getItem('token');
            let isExpired = false;
            if (token) {
              try {
                const decoded: any = JSON.parse(atob(token.split('.')[1]));
                const expiryTime = decoded.exp * 1000;
                const now = Date.now();
                isExpired = expiryTime < now;
              } catch (e) {
                // Can't decode, assume not expired
              }
            }
            
            const message = isExpired 
              ? 'Your session has expired. Please log out and log back in.'
              : 'Authentication failed. Please log out and log back in.';
            this.snackBar.open(message, 'Close', {
              duration: 5000,
            });
          } else if (error.status === 403) {
            this.snackBar.open('You do not have permission to access integrations.', 'Close', {
              duration: 5000,
            });
          } else {
            this.snackBar.open('Error loading integrations. Please try again.', 'Close', {
              duration: 3000,
            });
          }
          this.isLoading = false;
          this.cdr.markForCheck();
          return of([]);
        }),
      )
      .subscribe((integrations) => {
        this.integrations = integrations;
        this.isLoading = false;
        this.cdr.markForCheck();
      });
  }

  loadStatusSummary(): void {
    this.integrationService
      .getIntegrationStatusSummary()
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error loading status summary:', error);
          // Don't show snackbar for summary errors, just log
          return of(null);
        }),
      )
      .subscribe((summary) => {
        this.statusSummary = summary;
        this.cdr.markForCheck();
      });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(IntegrationDialogComponent, {
      width: '600px',
      data: { mode: 'create' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadIntegrations();
        this.loadStatusSummary();
      }
    });
  }

  openEditDialog(integration: Integration): void {
    const dialogRef = this.dialog.open(IntegrationDialogComponent, {
      width: '600px',
      data: { mode: 'edit', integration },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadIntegrations();
        this.loadStatusSummary();
      }
    });
  }

  testIntegration(integration: Integration): void {
    if (!integration.id) return;

    this.integrationService
      .testIntegration(integration.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result.success) {
            this.snackBar.open('Integration test successful', 'Close', {
              duration: 3000,
            });
          } else {
            this.snackBar.open(`Integration test failed: ${result.message}`, 'Close', {
              duration: 5000,
            });
          }
          this.loadIntegrations();
          this.loadStatusSummary();
        },
        error: (error) => {
          this.snackBar.open('Error testing integration', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  deleteIntegration(integration: Integration): void {
    if (!integration.id) return;

    if (confirm(`Are you sure you want to delete "${integration.name}"?`)) {
      this.integrationService
        .deleteIntegration(integration.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Integration deleted successfully', 'Close', {
              duration: 3000,
            });
            this.loadIntegrations();
            this.loadStatusSummary();
          },
          error: (error) => {
            this.snackBar.open('Error deleting integration', 'Close', {
              duration: 3000,
            });
          },
        });
    }
  }

  toggleStatus(integration: Integration): void {
    if (!integration.id) return;

    const newStatus =
      integration.status === IntegrationStatus.ACTIVE
        ? IntegrationStatus.INACTIVE
        : IntegrationStatus.ACTIVE;

    const updateDto: UpdateIntegrationDto = {
      status: newStatus,
    };

    this.integrationService
      .updateIntegration(integration.id, updateDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Integration status updated', 'Close', {
            duration: 3000,
          });
          this.loadIntegrations();
          this.loadStatusSummary();
        },
        error: (error) => {
          this.snackBar.open('Error updating integration status', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  getTypeLabel(type: IntegrationType): string {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  getStatusLabel(status: IntegrationStatus): string {
    return status.charAt(0) + status.slice(1).toLowerCase();
  }

  getStatusColor(status: IntegrationStatus): string {
    switch (status) {
      case IntegrationStatus.ACTIVE:
        return 'primary';
      case IntegrationStatus.INACTIVE:
        return '';
      case IntegrationStatus.ERROR:
        return 'warn';
      case IntegrationStatus.PENDING:
        return 'accent';
      default:
        return '';
    }
  }

  getTypeIcon(type: IntegrationType): string {
    switch (type) {
      case IntegrationType.PAYMENT_GATEWAY:
        return 'payment';
      case IntegrationType.SMS_SERVICE:
        return 'sms';
      case IntegrationType.CLOUD_STORAGE:
        return 'cloud';
      case IntegrationType.ACCOUNTING_SOFTWARE:
        return 'account_balance';
      case IntegrationType.PARENT_COMMUNICATION:
        return 'chat';
      case IntegrationType.LEARNING_MANAGEMENT:
        return 'school';
      default:
        return 'link';
    }
  }
}

