import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrollmentBillingReconciliationReportComponent } from './enrollment-billing-reconciliation-report.component';

describe('EnrollmentBillingReconciliationReportComponent', () => {
  let component: EnrollmentBillingReconciliationReportComponent;
  let fixture: ComponentFixture<EnrollmentBillingReconciliationReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EnrollmentBillingReconciliationReportComponent]
    });
    fixture = TestBed.createComponent(EnrollmentBillingReconciliationReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
