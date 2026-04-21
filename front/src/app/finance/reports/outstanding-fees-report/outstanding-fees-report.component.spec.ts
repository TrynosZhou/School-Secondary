import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutstandingFeesReportComponent } from './outstanding-fees-report.component';

describe('OutstandingFeesReportComponent', () => {
  let component: OutstandingFeesReportComponent;
  let fixture: ComponentFixture<OutstandingFeesReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OutstandingFeesReportComponent]
    });
    fixture = TestBed.createComponent(OutstandingFeesReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
