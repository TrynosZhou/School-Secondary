import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { ChartConfiguration, ChartType } from 'chart.js';
import { fetchEnrolsStats } from 'src/app/enrolment/store/enrolment.actions';
import { selectEnrolsStats } from 'src/app/enrolment/store/enrolment.selectors';

@Component({
  selector: 'app-enrolment-chart',
  templateUrl: './enrolment-chart.component.html',
  styleUrls: ['./enrolment-chart.component.css'],
})
export class EnrolmentChartComponent implements OnInit {
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [];
  public barChartData!: ChartConfiguration<'bar'>['data'];

  constructor(private store: Store) {
    this.store.dispatch(fetchEnrolsStats());
  }

  ngOnInit(): void {
    this.store.select(selectEnrolsStats).subscribe((res) => {
      if (res) {
        this.barChartData = {
          labels: [...res.clas],
          datasets: [
            { data: [...res.boys], label: 'Boys' },
            { data: [...res.girls], label: 'Girls' },
          ],
        };
      }
    });
  }

  // public barChartDat: ChartConfiguration<'bar'>['data'] = {
  //   labels: ['1A1', '1A2', '1A3', '1A4', '2A1', '2A2', '2A3', '2A4', '3A1', '3A2', '3A3', '3A4', '4A1', '4A2', '4A3', '4A4', '5Scie', '5Comm', '5Arts', '6Scie', '6Comm', '6Arts'],
  //   datasets: [
  //     { data: [11, 14, 8, 9, 12, 13, 10, 12, 13, 14, 11, 10, 13, 14, 10, 12, 12, 10, 13, 12, 10, 9], label: 'Boys' },
  //     { data: [10, 13, 14, 10, 12, 12, 10, 13, 12, 10, 9, 11, 14, 8, 9, 12, 13, 10, 12, 13, 14, 11,], label: 'Girls' },
  //   ],
  // };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,

    plugins: {
      title: {
        display: false,
        text: 'Current School Enrolment',
      },
    },
  };
}
