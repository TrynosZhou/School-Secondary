import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup } from '@angular/forms';
import { FinanceFilter } from 'src/app/finance/models/finance-filter.model';

@Component({
  selector: 'app-filter-finance-dialog',
  templateUrl: './filter-finance-dialog.component.html',
  styleUrls: ['./filter-finance-dialog.component.css'],
})
export class FilterFinanceDialogComponent implements OnInit {
  filterForm!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<FilterFinanceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FinanceFilter
  ) {}

  ngOnInit(): void {
    this.filterForm = new FormGroup({
      transactionType: new FormControl(this.data.transactionType || ''),
      startDate: new FormControl(this.data.startDate || ''),
      endDate: new FormControl(this.data.endDate || ''),
      minAmount: new FormControl(this.data.minAmount || null),
      maxAmount: new FormControl(this.data.maxAmount || null),
    });
  }

  onFilter(): void {
    this.dialogRef.close(this.filterForm.value);
  }

  onClear(): void {
    this.filterForm.reset();
    this.dialogRef.close({});
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
