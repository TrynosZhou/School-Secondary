import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { ChartConfiguration, ChartType } from 'chart.js';
import { selectAccStats } from 'src/app/auth/store/auth.selectors';

@Component({
  selector: 'app-accounts-chart',
  templateUrl: './accounts-chart.component.html',
  styleUrls: ['./accounts-chart.component.css'],
})
export class AccountsChartComponent implements OnInit {
  public doughnutChartData!: ChartConfiguration<'doughnut'>['data'];

  constructor(private store: Store) {
    // this.store.dispatch(fetchAccountStats());
  }

  ngOnInit(): void {
    this.store.select(selectAccStats).subscribe((res) => {
      if (res) {
        this.doughnutChartData = {
          labels: ['Admins', 'Teachers', 'Students', 'Reception'],
          datasets: [
            { data: [res.admins, res.teachers, res.students, res.reception] },
          ],
        };
      }
    });
  }

  public doughnutChartType: ChartType = 'doughnut';
}
