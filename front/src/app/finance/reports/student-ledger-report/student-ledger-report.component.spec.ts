import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentLedgerReportComponent } from './student-ledger-report.component';

describe('StudentLedgerReportComponent', () => {
  let component: StudentLedgerReportComponent;
  let fixture: ComponentFixture<StudentLedgerReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StudentLedgerReportComponent]
    });
    fixture = TestBed.createComponent(StudentLedgerReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
