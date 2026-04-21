import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentEnrolmentDetailsComponent } from './student-enrolment-details.component';

describe('StudentEnrolmentDetailsComponent', () => {
  let component: StudentEnrolmentDetailsComponent;
  let fixture: ComponentFixture<StudentEnrolmentDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StudentEnrolmentDetailsComponent]
    });
    fixture = TestBed.createComponent(StudentEnrolmentDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
