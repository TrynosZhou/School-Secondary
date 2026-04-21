import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenueRecognitionReportComponent } from './revenue-recognition-report.component';

describe('RevenueRecognitionReportComponent', () => {
  let component: RevenueRecognitionReportComponent;
  let fixture: ComponentFixture<RevenueRecognitionReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RevenueRecognitionReportComponent]
    });
    fixture = TestBed.createComponent(RevenueRecognitionReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
