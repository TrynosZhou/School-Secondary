import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectStudentsToBill } from '../../store/finance.selector';
import { billingActions } from '../../store/finance.actions';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import { Observable } from 'rxjs';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import { selectTerms } from 'src/app/enrolment/store/enrolment.selectors';

@Component({
  selector: 'app-students-to-bill',
  templateUrl: './students-to-bill.component.html',
  styleUrls: ['./students-to-bill.component.css'],
})
export class StudentsToBillComponent implements OnInit {
  constructor(private store: Store) {}
  terms$ = this.store.select(selectTerms);

  studentsToBill$: Observable<EnrolsModel[]> =
    this.store.select(selectStudentsToBill);
  currentTerm!: TermsModel;
  @Output() selectedEnrolChange = new EventEmitter<EnrolsModel>();
  selectedEnrol: EnrolsModel | null = null;

  ngOnInit(): void {}

  changeSelectedEnrol(enrol: EnrolsModel) {
    this.selectedEnrol = enrol;
    this.selectedEnrolChange.emit(enrol);
  }

  onTermChange(term: TermsModel) {
    if (this.currentTerm) {
      const num = this.currentTerm.num;
      const year = this.currentTerm.year;
      this.store.dispatch(billingActions.fetchStudentsToBill({ num, year }));
    }
  }
}
