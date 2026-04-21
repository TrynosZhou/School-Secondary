import { Component, EventEmitter, Output, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ThemeService, Theme } from 'src/app/services/theme.service';
import { ExemptionModel } from '../../models/exemption.model';
import { ExemptionItemComponent } from './exemption-item/exemption-item.component';

@Component({
  selector: 'app-exemptions-list',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    ExemptionItemComponent,
  ],
  templateUrl: './exemptions-list.component.html',
  styleUrls: ['./exemptions-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExemptionsListComponent implements OnInit, OnDestroy {
  @Output() exemptionSelected = new EventEmitter<ExemptionModel>();
  @Output() editExemption = new EventEmitter<ExemptionModel>();
  @Output() deleteExemption = new EventEmitter<ExemptionModel>();
  @Input() exemptions: ExemptionModel[] = [];
  @Input() selectedExemption: ExemptionModel | null = null;
  @Input() isLoading = false;
  
  currentTheme: Theme = 'light';
  
  private destroy$ = new Subject<void>();

  constructor(
    public themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe((theme) => {
        this.currentTheme = theme;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectExemption(exemption: ExemptionModel): void {
    this.exemptionSelected.emit(exemption);
  }

  isSelected(exemption: ExemptionModel): boolean {
    return this.selectedExemption?.id === exemption.id;
  }

  onEdit(exemption: ExemptionModel, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.editExemption.emit(exemption);
  }

  onDelete(exemption: ExemptionModel, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.deleteExemption.emit(exemption);
  }
}

