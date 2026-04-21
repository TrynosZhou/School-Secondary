import { Component, Input } from '@angular/core';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';

@Component({
  selector: 'app-student-enrolment-details',
  templateUrl: './student-enrolment-details.component.html',
  styleUrls: ['./student-enrolment-details.component.css'],
})
export class StudentEnrolmentDetailsComponent {
  @Input() studentEnrol!: EnrolsModel;
}
