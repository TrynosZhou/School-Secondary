import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExemptionSummaryByTypeTableComponent } from './exemption-summary-by-type-table.component.component';

describe('ExemptionSummaryByTypeTableComponent', () => {
  let component: ExemptionSummaryByTypeTableComponent;
  let fixture: ComponentFixture<ExemptionSummaryByTypeTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExemptionSummaryByTypeTableComponent]
    });
    fixture = TestBed.createComponent(ExemptionSummaryByTypeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
