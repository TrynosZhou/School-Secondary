import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExemptionSummaryByStudentTableComponent } from './exemption-summary-by-student-table.component';

describe('ExemptionSummaryByStudentTableComponent', () => {
  let component: ExemptionSummaryByStudentTableComponent;
  let fixture: ComponentFixture<ExemptionSummaryByStudentTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExemptionSummaryByStudentTableComponent]
    });
    fixture = TestBed.createComponent(ExemptionSummaryByStudentTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
