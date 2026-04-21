import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentReportCardsComponent } from './student-report-cards.component';

describe('StudentReportCardsComponent', () => {
  let component: StudentReportCardsComponent;
  let fixture: ComponentFixture<StudentReportCardsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StudentReportCardsComponent]
    });
    fixture = TestBed.createComponent(StudentReportCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
