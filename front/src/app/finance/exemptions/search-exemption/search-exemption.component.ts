import { Component, EventEmitter, Output, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, map, Observable, of, startWith, Subject, takeUntil } from 'rxjs';
import { ExemptionModel } from '../../models/exemption.model';
import { ExemptionType } from '../../enums/exemption-type.enum';
import { ExemptionService } from '../../services/exemption.service';
import { ThemeService, Theme } from 'src/app/services/theme.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-search-exemption',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTooltipModule,
    SharedModule,
  ],
  templateUrl: './search-exemption.component.html',
  styleUrls: ['./search-exemption.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchExemptionComponent implements OnInit, OnDestroy {
  @Output() exemptionSelected = new EventEmitter<ExemptionModel>();
  @Output() filtersChanged = new EventEmitter<{
    searchTerm?: string;
    type?: ExemptionType;
    isActive?: boolean;
  }>();

  searchControl = new FormControl<string | ExemptionModel>('');
  typeControl = new FormControl<string>('');
  activeControl = new FormControl<boolean | null>(null);
  
  exemptionTypes = Object.values(ExemptionType);
  searchResults$: Observable<ExemptionModel[]> = of([]);
  exemptions: ExemptionModel[] = [];
  filteredExemptions: ExemptionModel[] = [];
  currentTheme: Theme = 'light';
  
  private destroy$ = new Subject<void>();

  constructor(
    private exemptionService: ExemptionService,
    public themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe((theme) => {
        this.currentTheme = theme;
        this.cdr.markForCheck();
      });

    // Load all exemptions
    this.loadExemptions();

    // Setup search
    this.searchControl.valueChanges
      .pipe(
        startWith(''),
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe((searchTerm) => {
        this.applyFilters();
        this.cdr.markForCheck();
      });

    // Setup type filter
    this.typeControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.applyFilters();
        this.cdr.markForCheck();
      });

    // Setup active filter
    this.activeControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.applyFilters();
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadExemptions(): void {
    this.exemptionService.getAllExemptions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (exemptions) => {
          this.exemptions = exemptions;
          this.applyFilters();
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading exemptions:', error);
        }
      });
  }

  applyFilters(): void {
    let filtered = [...this.exemptions];
    const rawSearch = this.searchControl.value;
    const searchTerm =
      typeof rawSearch === 'string' ? rawSearch.toLowerCase() : '';
    const typeValue = this.typeControl.value;
    const isActive = this.activeControl.value;

    // Apply search filter
    if (searchTerm) {
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
    const type = typeValue && typeValue !== '' && Object.values(ExemptionType).includes(typeValue as ExemptionType)
      ? (typeValue as ExemptionType)
      : undefined;
    
    if (type) {
      filtered = filtered.filter((exemption) => exemption.type === type);
    }

    // Apply active filter
    if (isActive !== null) {
      filtered = filtered.filter((exemption) => exemption.isActive === isActive);
    }

    this.filteredExemptions = filtered;
    this.searchResults$ = of(filtered);

    // Emit filter changes
    this.filtersChanged.emit({
      searchTerm: searchTerm || undefined,
      type: type,
      isActive: isActive !== null ? isActive : undefined,
    });

    this.cdr.markForCheck();
  }

  selectExemption(exemption: ExemptionModel): void {
    this.exemptionSelected.emit(exemption);
    // Keep selection visible in the input so users can immediately edit/delete without scrolling
    this.searchControl.setValue(exemption, { emitEvent: false });
    this.cdr.markForCheck();
  }

  displayFn(exemption: ExemptionModel): string {
    if (!exemption || !exemption.student) return '';
    return `${exemption.student.studentNumber} - ${exemption.student.name} ${exemption.student.surname} (${exemption.type})`;
  }

  clearSearchSelection(): void {
    this.searchControl.setValue('', { emitEvent: true });
    this.cdr.markForCheck();
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.typeControl.setValue('');
    this.activeControl.setValue(null);
    this.applyFilters();
  }
}

