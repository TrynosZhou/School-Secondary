import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { tap } from 'rxjs';
import { ClassesModel } from 'src/app/enrolment/models/classes.model';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import { selectTerms } from 'src/app/enrolment/store/enrolment.selectors';

@Component({
  selector: 'app-class-attendance-summary',
  templateUrl: './class-attendance-summary.component.html',
  styleUrls: ['./class-attendance-summary.component.css'],
})
export class ClassAttendanceSummaryComponent implements OnInit {
  public pieChartData!: ChartConfiguration<'pie'>['data'];
  @Input()
  clas!: ClassesModel;
  term!: TermsModel;
  present: number = 13;
  absent: number = 12;
  absentStudents: EnrolsModel[] = [];

  constructor(private store: Store) {
    // const { name } = this.clas;
    // const { num, year } = this.term;
    // this.store.dispatch(
    //   markRegisterActions.fetchDayRegisterByClass({ name, num, year })
    // );
  }

  ngOnInit(): void {
    let today = new Date();
    console.log(today);

    this.store
      .select(selectTerms)
      .pipe(
        tap((terms) =>
          terms.map((trm) => {
            if (trm.startDate < today && trm.endDate > today) {
              this.term = { ...trm };
              console.log(this.term);
            }
          })
        )
      )
      .subscribe();

    this.pieChartData = {
      labels: ['Absent', 'Present'],
      datasets: [{ data: [this.absent, this.present] }],
    };
  }

  public pieChartType: ChartType = 'pie';

  public piechartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };
}
