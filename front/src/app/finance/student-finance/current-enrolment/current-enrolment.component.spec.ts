import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CurrentEnrolmentComponent } from './current-enrolment.component';
import { MaterialModule } from '../../../material/material.module';
import { CommonModule } from '@angular/common';

describe('CurrentEnrolmentComponent', () => {
  let component: CurrentEnrolmentComponent;
  let fixture: ComponentFixture<CurrentEnrolmentComponent>;
  let actions$: Observable<unknown>;

  beforeEach(() => {
    actions$ = new Observable();
    TestBed.configureTestingModule({
      declarations: [CurrentEnrolmentComponent],
      imports: [CommonModule, MaterialModule],
      providers: [
        provideMockStore({ initialState: {} }),
        provideMockActions(() => actions$),
        { provide: MAT_DIALOG_DATA, useValue: { enrol: null } },
        { provide: MatDialogRef, useValue: null },
      ],
    });
    fixture = TestBed.createComponent(CurrentEnrolmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
