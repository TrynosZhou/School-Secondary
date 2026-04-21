import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExemptionReportFiltersComponent } from './exemption-report-filters.component';

describe('ExemptionReportFiltersComponent', () => {
  let component: ExemptionReportFiltersComponent;
  let fixture: ComponentFixture<ExemptionReportFiltersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExemptionReportFiltersComponent]
    });
    fixture = TestBed.createComponent(ExemptionReportFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
