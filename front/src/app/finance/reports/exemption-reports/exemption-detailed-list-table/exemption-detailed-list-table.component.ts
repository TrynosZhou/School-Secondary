import {
  Component,
  Input,
  OnInit,
  ViewChild,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ExemptionReportDetailedItem } from 'src/app/finance/store/exemption-report.selectors';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-exemption-detailed-list-table',
  templateUrl: './exemption-detailed-list-table.component.html',
  styleUrls: ['./exemption-detailed-list-table.component.css'],
})
export class ExemptionDetailedListTableComponent
  implements OnInit, OnChanges, AfterViewInit
{
  @Input() detailedItems!: ExemptionReportDetailedItem[];

  displayedColumns: string[] = [
    'invoiceNumber',
    'invoiceDate',
    'studentName',
    'studentNumber',
    'enrolName',
    'exemptionType',
    'exemptedAmount',
    'grossBill',
    'netBillAfterExemption',
  ];
  dataSource!: MatTableDataSource<ExemptionReportDetailedItem>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.detailedItems);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['detailedItems'] && this.dataSource) {
      this.dataSource.data = this.detailedItems;
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
