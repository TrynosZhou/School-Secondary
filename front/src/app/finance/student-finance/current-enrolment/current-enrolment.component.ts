import { Component, Inject, Input, OnInit, Optional } from '@angular/core';
import { Store } from '@ngrx/store';
import { MatDialogRef } from '@angular/material/dialog';
import { Actions, ofType } from '@ngrx/effects';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import { selectCurrentEnrolment, selectClasses } from 'src/app/enrolment/store/enrolment.selectors';
import { currentEnrolementActions } from 'src/app/enrolment/store/enrolment.actions';
import { Residence } from 'src/app/enrolment/models/residence.enum';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClassesModel } from 'src/app/enrolment/models/classes.model';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { invoiceActions } from '../../store/finance.actions';

@Component({
  selector: 'app-current-enrolment',
  templateUrl: './current-enrolment.component.html',
  styleUrls: ['./current-enrolment.component.scss'],
})
export class CurrentEnrolmentComponent implements OnInit {
  @Input() studentNumber: string | undefined = undefined;
  editable = false;
  residences = [...Object.values(Residence)];
  currentEnrolment!: EnrolsModel;
  classes$: Observable<ClassesModel[]> = this.store.select(selectClasses);
  editClassName = '';
  editResidence: Residence = Residence.Day;
  saving = false;

  constructor(
    private store: Store,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { enrol: EnrolsModel },
    @Optional() public dialogRef: MatDialogRef<CurrentEnrolmentComponent>,
    private actions$: Actions
  ) {
    if (this.data && this.data.enrol) {
      this.currentEnrolment = this.data.enrol;
      this.editClassName = this.data.enrol.name;
      this.editResidence = this.data.enrol.residence;
      this.editable = false;
    } else {
      this.store.select(selectCurrentEnrolment).subscribe((enrolment) => {
        if (enrolment) {
          this.currentEnrolment = enrolment;
          this.editClassName = enrolment.name;
          this.editResidence = enrolment.residence;
        }
      });
    }
  }

  ngOnInit(): void {
    if (this.studentNumber) {
      this.store.dispatch(
        currentEnrolementActions.fetchCurrentEnrolment({
          studentNumber: this.studentNumber,
        })
      );
    }
  }

  startEdit(): void {
    this.editable = true;
    this.editClassName = this.currentEnrolment.name;
    this.editResidence = this.currentEnrolment.residence;
  }

  cancelEdit(): void {
    this.editable = false;
    this.editClassName = this.currentEnrolment.name;
    this.editResidence = this.currentEnrolment.residence;
  }

  saveEnrolment(): void {
    const name = this.editClassName?.trim();
    if (!name) return;
    const enrolment: EnrolsModel = {
      ...this.currentEnrolment,
      name,
      residence: this.editResidence,
    };
    this.saving = true;
    this.store.dispatch(
      currentEnrolementActions.updateCurrentEnrolment({ enrol: enrolment })
    );
    this.actions$
      .pipe(
        ofType(
          currentEnrolementActions.updateCurrentEnrolmentSuccess,
          currentEnrolementActions.updateCurrentEnrolmentFail
        ),
        take(1)
      )
      .subscribe((action) => {
        this.saving = false;
        if (action.type === currentEnrolementActions.updateCurrentEnrolmentSuccess.type) {
          const updatedEnrol = (action as { enrol: EnrolsModel }).enrol;
          this.store.dispatch(
            invoiceActions.updateInvoiceEnrolment({ enrol: updatedEnrol })
          );
          this.currentEnrolment = updatedEnrol;
          this.editable = false;
          if (this.dialogRef) {
            this.dialogRef.close({ updated: true, enrol: updatedEnrol });
          }
        }
      });
  }
}
