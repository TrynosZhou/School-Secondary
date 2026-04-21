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
import { ExemptionReportSummaryByEnrolment } from 'src/app/finance/store/exemption-report.selectors';

@Component({
  selector: 'app-exemption-summary-by-enrolment-table',
  templateUrl: './exemption-summary-by-enrolment-table.component.html',
  styleUrls: ['./exemption-summary-by-enrolment-table.component.css'],
})
export class ExemptionSummaryByEnrolmentTableComponent
  implements OnInit, OnChanges, AfterViewInit
{
  @Input() summaryData!: ExemptionReportSummaryByEnrolment[];

  displayedColumns: string[] = ['enrolName', 'totalExempted', 'invoiceCount'];
  dataSource!: MatTableDataSource<ExemptionReportSummaryByEnrolment>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.summaryData);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['summaryData'] && this.dataSource) {
      this.dataSource.data = this.summaryData;
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
