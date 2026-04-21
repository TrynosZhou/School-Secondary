import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgedDebtorsReportComponent } from './aged-debtors-report.component';

describe('AgedDebtorsReportComponent', () => {
  let component: AgedDebtorsReportComponent;
  let fixture: ComponentFixture<AgedDebtorsReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AgedDebtorsReportComponent]
    });
    fixture = TestBed.createComponent(AgedDebtorsReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
