import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExemptionSummaryByEnrolmentTableComponent } from './exemption-summary-by-enrolment-table.component';

describe('ExemptionSummaryByEnrolmentTableComponent', () => {
  let component: ExemptionSummaryByEnrolmentTableComponent;
  let fixture: ComponentFixture<ExemptionSummaryByEnrolmentTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExemptionSummaryByEnrolmentTableComponent]
    });
    fixture = TestBed.createComponent(ExemptionSummaryByEnrolmentTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
