import {
  Component,
  Input,
  OnInit,
  ViewChild,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ExemptionReportSummaryByType } from 'src/app/finance/store/exemption-report.selectors';

@Component({
  selector: 'app-exemption-summary-by-type-table',
  templateUrl: './exemption-summary-by-type-table.component.component.html',
  styleUrls: ['./exemption-summary-by-type-table.component.component.css'],
})
export class ExemptionSummaryByTypeTableComponent implements OnInit, OnChanges {
  @Input() summaryData!: ExemptionReportSummaryByType[];

  displayedColumns: string[] = ['type', 'totalExempted', 'count'];
  dataSource!: MatTableDataSource<ExemptionReportSummaryByType>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.summaryData);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['summaryData'] && this.dataSource) {
      this.dataSource.data = this.summaryData;
      // Re-assign paginator and sort if they are initialized after data changes
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
    }
  }

  ngAfterViewInit() {
    // These need to be set after the view (and thus MatPaginator/MatSort) is initialized
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
