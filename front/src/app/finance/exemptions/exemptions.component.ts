import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ThemeService, Theme } from 'src/app/services/theme.service';
import { ExemptionModel } from '../models/exemption.model';
import { ExemptionService } from '../services/exemption.service';
import { ExemptionsListComponent } from './exemptions-list/exemptions-list.component';
import { CreateEditExemptionComponent } from './create-edit-exemption/create-edit-exemption.component';
import { SearchExemptionComponent } from './search-exemption/search-exemption.component';
import { ExemptionType } from '../enums/exemption-type.enum';

@Component({
  selector: 'app-exemptions',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    ExemptionsListComponent,
    CreateEditExemptionComponent,
    SearchExemptionComponent,
  ],
  templateUrl: './exemptions.component.html',
  styleUrls: ['./exemptions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExemptionsComponent implements OnInit, OnDestroy {
  currentView: 'list' | 'create' = 'list';
  selectedExemption: ExemptionModel | null = null;
  exemptions: ExemptionModel[] = [];
  filteredExemptions: ExemptionModel[] = [];
  isLoading = false;
  currentTheme: Theme = 'light';
  
  // Filter state
  currentFilters: {
    searchTerm?: string;
    type?: ExemptionType;
    isActive?: boolean;
  } = {};
  
  private destroy$ = new Subject<void>();

  constructor(
    public title: Title,
    public themeService: ThemeService,
    private exemptionService: ExemptionService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.title.setTitle('Exemption Management');
  }

  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe((theme) => {
        this.currentTheme = theme;
        this.cdr.markForCheck();
      });

    // Load exemptions on init
    this.loadExemptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadExemptions(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.exemptionService.getAllExemptions(
      this.currentFilters.searchTerm,
      this.currentFilters.type,
      this.currentFilters.isActive
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (exemptions) => {
          this.exemptions = exemptions;
          this.filteredExemptions = exemptions;
          this.isLoading = false;
          this.applyFilters();
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading exemptions:', error);
          this.isLoading = false;
          const errorMessage = error?.error?.message || error?.message || 'Failed to load exemptions';
          this.snackBar.open(`Error: ${errorMessage}`, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar'],
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          this.cdr.markForCheck();
        }
      });
  }

  onCreateClick(): void {
    this.currentView = 'create';
    this.selectedExemption = null;
    this.cdr.markForCheck();
  }

  onExemptionSelected(exemption: ExemptionModel): void {
    this.selectedExemption = exemption;
    this.cdr.markForCheck();
  }

  onEditClick(exemption: ExemptionModel): void {
    this.selectedExemption = exemption;
    this.currentView = 'create';
    this.cdr.markForCheck();
  }

  onDeleteClick(exemption: ExemptionModel): void {
    this.confirmDelete(exemption);
  }

  onExemptionSaved(exemption: ExemptionModel): void {
    this.currentView = 'list';
    this.selectedExemption = null;
    this.loadExemptions();
    this.snackBar.open(
      exemption.id && this.exemptions.find(e => e.id === exemption.id)
        ? 'Exemption updated successfully!'
        : 'Exemption created successfully!',
      'Close',
      {
        duration: 3000,
        panelClass: ['success-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top',
      }
    );
  }

  onCancelEdit(): void {
    this.currentView = 'list';
    this.selectedExemption = null;
    this.cdr.markForCheck();
  }

  onFiltersChanged(filters: { searchTerm?: string; type?: ExemptionType; isActive?: boolean }): void {
    this.currentFilters = filters;
    this.applyFilters();
    this.cdr.markForCheck();
  }

  formatTypeLabel(type: ExemptionType | string): string {
    return String(type)
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  private applyFilters(): void {
    let filtered = [...this.exemptions];

    // Apply search filter
    if (this.currentFilters.searchTerm) {
      const searchTerm = this.currentFilters.searchTerm.toLowerCase();
      filtered = filtered.filter((exemption) => {
        const student = exemption.student;
        return (
          student.name.toLowerCase().includes(searchTerm) ||
          student.surname.toLowerCase().includes(searchTerm) ||
          student.studentNumber.toLowerCase().includes(searchTerm) ||
          (student.email || '').toLowerCase().includes(searchTerm) ||
          (exemption.description || '').toLowerCase().includes(searchTerm) ||
          exemption.type.toLowerCase().includes(searchTerm)
        );
      });
    }

    // Apply type filter
    if (this.currentFilters.type) {
      filtered = filtered.filter((exemption) => exemption.type === this.currentFilters.type);
    }

    // Apply active filter
    if (this.currentFilters.isActive !== undefined) {
      filtered = filtered.filter((exemption) => exemption.isActive === this.currentFilters.isActive);
    }

    this.filteredExemptions = filtered;
  }

  private async confirmDelete(exemption: ExemptionModel): Promise<void> {
    const { ConfirmDialogComponent } = await import('src/app/shared/confirm-dialog/confirm-dialog.component');
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      maxWidth: '90vw',
      data: {
        title: 'Delete Exemption',
        message: `Are you sure you want to delete the exemption for ${exemption.student.name} ${exemption.student.surname} (${exemption.student.studentNumber})?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'warning'
      }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((confirmed) => {
        if (confirmed && exemption.id) {
          this.deleteExemption(exemption.id);
        }
      });
  }

  private deleteExemption(id: number): void {
    this.exemptionService.deleteExemption(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadExemptions();
          this.selectedExemption = null;
          this.snackBar.open('Exemption deleted successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        },
        error: (error) => {
          console.error('Error deleting exemption:', error);
          const errorMessage = error?.error?.message || error?.message || 'Failed to delete exemption';
          this.snackBar.open(`Error: ${errorMessage}`, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar'],
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        }
      });
  }
}

